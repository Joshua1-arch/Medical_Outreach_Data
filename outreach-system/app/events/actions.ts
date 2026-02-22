'use server';

import dbConnect from "@/lib/db";
import { sendMedicalResultEmail } from "@/lib/medical-email";
import Record from "@/models/Record";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import crypto from "crypto";

import Event from "@/models/Event";
import { submissionRateLimit, getIP } from "@/lib/rate-limit";

function generateRetrievalCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePatientHash(data: Record<string, unknown>): string | null {
    const findField = (patterns: string[]): string => {
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();
            for (const pattern of patterns) {
                if (lowerKey.includes(pattern.toLowerCase())) {
                    return String(value || '').trim().toLowerCase();
                }
            }
        }
        return '';
    };

    const name = findField(['name', 'patient name', 'full name', 'fullname']);
    const phone = findField(['phone', 'mobile', 'telephone', 'contact']);
    const gender = findField(['gender', 'sex']);

    if (!name || (!phone && !gender)) {
        return null;
    }

    const combined = `${name}|${phone}|${gender}`.toLowerCase();
    return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32);
}

function extractPatientPhone(data: Record<string, unknown>): string | undefined {
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact')) {
            if (value) return String(value);
        }
    }
    return undefined;
}

export async function submitRecord(eventId: string, data: Record<string, unknown>) {
    try {
        // 1. Rate Limiting (Spam Protection)
        const ip = await getIP();
        const { success } = await submissionRateLimit.limit(ip);
        if (!success) {
            return { success: false, message: 'Too many submissions. Please wait a minute.' };
        }

        const session = await auth();
        await dbConnect();

        const event = await Event.findById(eventId);
        if (!event) return { success: false, message: 'Event not found' };

        let recordedBy = undefined;

        if (event.isPublic) {
            recordedBy = session?.user?.id;
        } else {
            if (!session?.user?.id) {
                return { success: false, message: 'Unauthorized' };
            }
            recordedBy = session.user.id;
        }

        const retrievalCode = generateRetrievalCode();
        const patientHash = generatePatientHash(data);
        const patientPhone = extractPatientPhone(data);

        if (patientPhone) {
            const existingRecord = await Record.findOne({
                eventId,
                patientPhone
            });

            if (existingRecord) {
                return { success: false, message: 'Phone number already exists' };
            }
        }

        await Record.create({
            eventId,
            projectID: eventId, 
            data,
            recordedBy,
            retrievalCode,
            patientHash,
            patientPhone
        });

        revalidatePath(`/events/${eventId}/enter-data`);
        revalidatePath(`/e/${eventId}`);

        return { success: true, message: 'Record saved successfully!', code: retrievalCode };
    } catch (error: any) {
        console.error('Submit Record Error:', error);
        return { success: false, message: 'An evaluation error occurred. Please try again later.' };
    }
}

export async function searchPatientHistory(data: Record<string, unknown>, currentEventId: string) {
    try {
        await dbConnect();

        const patientHash = generatePatientHash(data);
        if (!patientHash) {
            return { success: false, found: false, message: 'Insufficient data for patient lookup' };
        }

        const previousRecords = await Record.find({
            patientHash,
            eventId: { $ne: currentEventId }
        })
            .populate('eventId', 'title location date')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        if (!previousRecords || previousRecords.length === 0) {
            return { success: true, found: false, message: 'No previous records found' };
        }

        const history = previousRecords.map((record) => {
            const eventTitle = record.eventId?.title || 'Unknown Event';
            const eventDate = record.eventId?.date ? new Date(record.eventId.date) : new Date(record.createdAt);
            const recordDate = new Date(record.createdAt);

            const monthsAgo = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const timeAgo = monthsAgo < 1 ? 'Less than a month ago' :
                monthsAgo === 1 ? '1 month ago' :
                    `${monthsAgo} months ago`;

            const prevData = record.data || {};
            const vitals: Record<string, string> = {};

            const vitalPatterns = [
                { patterns: ['bp', 'blood pressure'], label: 'BP' },
                { patterns: ['weight'], label: 'Weight' },
                { patterns: ['bmi'], label: 'BMI' },
                { patterns: ['blood sugar', 'glucose', 'fbs', 'rbs'], label: 'Blood Sugar' },
                { patterns: ['pcv', 'hematocrit'], label: 'PCV' },
            ];

            for (const { patterns, label } of vitalPatterns) {
                for (const [key, value] of Object.entries(prevData)) {
                    const lowerKey = key.toLowerCase();
                    for (const pattern of patterns) {
                        if (lowerKey.includes(pattern) && value) {
                            vitals[label] = String(value);
                            break;
                        }
                    }
                }
            }

            return {
                _id: record._id.toString(),
                eventTitle,
                eventDate: eventDate.toISOString(),
                recordDate: recordDate.toISOString(),
                timeAgo,
                vitals
            };
        });

        return {
            success: true,
            found: true,
            history,
            message: `Found ${history.length} previous record(s)`
        };
    } catch (error) {
        console.error('Patient History Error:', error);
        return { success: false, found: false, message: 'An evaluation error occurred while searching history.' };
    }
}

export async function getRecordByCode(query: string, eventId?: string) {
    try {
        await dbConnect();

        const trimmedQuery = query.trim();

        const normalizePhone = (str: string) => str.replace(/\D/g, '');
        const normalizedQuery = normalizePhone(trimmedQuery);

        const codeQuery: any = {
            retrievalCode: { $regex: new RegExp(`^${trimmedQuery}$`, 'i') }
        };
        if (eventId) {
            codeQuery.eventId = eventId;
        }

        let record = await Record.findOne(codeQuery);

        if (!record && normalizedQuery.length >= 5) {
            const filter: any = {};
            if (eventId) {
                filter.eventId = eventId;
            }

            const allRecords = await Record.find(filter).lean();

            let foundRecordId = null;

            for (const rec of allRecords) {
                const data = rec.data || {};

                for (const [key, value] of Object.entries(data)) {
                    const lowerKey = key.toLowerCase();

                    if (lowerKey.includes('phone') ||
                        lowerKey.includes('mobile') ||
                        lowerKey.includes('telephone') ||
                        lowerKey.includes('contact')) {

                        const normalizedValue = normalizePhone(String(value || ''));

                        if (normalizedValue === normalizedQuery ||
                            normalizedValue.endsWith(normalizedQuery) ||
                            normalizedQuery.endsWith(normalizedValue)) {
                            foundRecordId = rec._id;

                            break;
                        }
                    }
                }

                if (foundRecordId) break;
            }

            if (foundRecordId) {
                record = await Record.findById(foundRecordId);
            }
        }

        if (!record) {
            return { success: false, message: 'Record not found' };
        }

        return { success: true, data: JSON.parse(JSON.stringify(record)) };
    } catch (error) {
        console.error('Fetch Record Error:', error);
        return { success: false, message: 'An evaluation error occurred while fetching the record.' };
    }
}

export async function updateRecordByCode(code: string, data: Record<string, unknown>) {
    try {
        await dbConnect();

        const record = await Record.findOne({ retrievalCode: code });
        if (!record) return { success: false, message: 'Invalid code' };

        record.data = { ...record.data, ...data };
        await record.save();

        revalidatePath(`/e/${record.eventId}`);

        return { success: true, message: 'Record updated successfully!' };
    } catch (error) {
        console.error('Update Record Error:', error);
        return { success: false, message: 'An evaluation error occurred while updating.' };
    }
}

export async function deleteRecord(recordId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const record = await Record.findByIdAndDelete(recordId);
        if (!record) return { success: false, message: 'Record not found' };

        revalidatePath(`/dashboard/event/${record.eventId}/builder`);

        return { success: true, message: 'Record deleted' };
    } catch (error) {
        console.error('Delete Record Error:', error);
        return { success: false, message: 'An evaluation error occurred while deleting.' };
    }
}

export async function updateRecordById(recordId: string, data: Record<string, unknown>) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const record = await Record.findByIdAndUpdate(recordId, { data }, { new: true });

        revalidatePath(`/dashboard/event/${record.eventId}/builder`);
        return { success: true, message: 'Record updated' };
    } catch (error) {
        console.error('Update Record Error:', error);
        return { success: false, message: 'An evaluation error occurred while updating.' };
    }
}

export async function sendResultEmail(recordId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        await dbConnect();

        const record = await Record.findById(recordId).populate('eventId');

        if (!record) {
            return { success: false, message: 'Record not found' };
        }

        const data = record.data || {};

        const findValue = (patterns: string[]) => {
            for (const key of Object.keys(data)) {
                const lowerKey = key.toLowerCase();
                for (const pattern of patterns) {
                    if (lowerKey.includes(pattern.toLowerCase())) {
                        return data[key];
                    }
                }
            }
            return null;
        };

        const email = findValue(['email', 'e-mail', 'mail']);
        const name = findValue(['name', 'patient', 'fullname', 'full name']) || 'Patient';

        if (!email) {
            return { success: false, message: 'No email address found for this patient' };
        }

        const eventName = record.eventId?.title || 'Medical Outreach';

        const emailResult = await sendMedicalResultEmail(
            email,
            name,
            eventName,
            data, 
            {}    
        );

        if (!emailResult.success) {
            return { success: false, message: 'Failed to send email: ' + emailResult.message };
        }

        record.resultEmailSent = true;
        await record.save();

        revalidatePath(`/dashboard/event/${record.eventId._id || record.eventId}/builder`);

        return { success: true, message: 'Result sent to ' + email };

    } catch (error) {
        console.error('Send Email Error:', error);
        return { success: false, message: 'An evaluation error occurred while sending the email.' };
    }
}
