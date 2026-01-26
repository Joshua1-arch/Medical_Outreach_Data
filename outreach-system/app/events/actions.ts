'use server';

import dbConnect from "@/lib/db";
import Record from "@/models/Record";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import crypto from "crypto";

import Event from "@/models/Event";

function generateRetrievalCode() {
    // Generate a 6-character alphanumeric code (e.g., A7X92B)
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generate a patient hash from identifying information.
 * Uses Name + Phone + Gender to create a unique identifier.
 * This allows tracking the same patient across different events.
 */
function generatePatientHash(data: Record<string, any>): string | null {
    // Try to extract identifying fields (case-insensitive key matching)
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

    // Need at least name and one other identifier
    if (!name || (!phone && !gender)) {
        return null;
    }

    // Create a hash from the combined values
    const combined = `${name}|${phone}|${gender}`.toLowerCase();
    return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32);
}

export async function submitRecord(eventId: string, data: Record<string, any>) {
    try {
        const session = await auth();
        await dbConnect();

        // Check if event exists and its public status
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

        await Record.create({
            eventId,
            data,
            recordedBy,
            retrievalCode,
            patientHash
        });

        revalidatePath(`/events/${eventId}/enter-data`);
        revalidatePath(`/e/${eventId}`);

        return { success: true, message: 'Record saved successfully!', code: retrievalCode };
    } catch (error) {
        console.error('Failed to submit record:', error);
        return { success: false, message: 'Failed to save record' };
    }
}

/**
 * Search for patient history by computing the hash from current input.
 * Returns previous records for the same patient from different events.
 */
export async function searchPatientHistory(data: Record<string, any>, currentEventId: string) {
    try {
        await dbConnect();

        const patientHash = generatePatientHash(data);
        if (!patientHash) {
            return { success: false, found: false, message: 'Insufficient data for patient lookup' };
        }

        // Find previous records with this hash, excluding current event
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

        // Format the history for display
        const history = previousRecords.map((record: any) => {
            const eventTitle = record.eventId?.title || 'Unknown Event';
            const eventDate = record.eventId?.date ? new Date(record.eventId.date) : new Date(record.createdAt);
            const recordDate = new Date(record.createdAt);

            // Calculate time ago
            const monthsAgo = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const timeAgo = monthsAgo < 1 ? 'Less than a month ago' :
                monthsAgo === 1 ? '1 month ago' :
                    `${monthsAgo} months ago`;

            // Extract key vitals from previous record data
            const prevData = record.data || {};
            const vitals: Record<string, string> = {};

            // Try to find common vital fields
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
        console.error('Failed to search patient history:', error);
        return { success: false, found: false, message: 'Error searching patient history' };
    }
}

export async function getRecordByCode(code: string) {
    try {
        await dbConnect();
        console.log(`🔍 Searching for record with code: "${code}"`); // Debug Log
        const record = await Record.findOne({ retrievalCode: code });

        if (!record) {
            console.log(`❌ Record not found for code: "${code}"`);
            return { success: false, message: 'Record not found' };
        }

        console.log(`✅ Record found: ${record._id}`);
        // Return clear data
        return { success: true, data: JSON.parse(JSON.stringify(record)) };
    } catch (error) {
        console.error('Failed to fetch record:', error);
        return { success: false, message: 'Error fetching record' };
    }
}

export async function updateRecordByCode(code: string, data: Record<string, any>) {
    try {
        await dbConnect();

        // Merge data? Or overwrite? 
        // User workflow: "Fills missing fields". Usually implies merge.
        // Mongoose generic update doesn't automatically deep merge map/mixed unless specified.
        // But for this simple key-value store, we can merge in JS or use $set.

        // Let's fetch first to merge safely or use $set for each key if data is flat.
        // Since `data` is Mixed, updating `data` usually replaces it unless we dot-walk.
        // EASIEST: Read, Merge, Save.

        const record = await Record.findOne({ retrievalCode: code });
        if (!record) return { success: false, message: 'Invalid code' };

        // Check if event allows updates? (Assuming yes for now)

        // Merge existing data with new data
        record.data = { ...record.data, ...data };
        await record.save();

        revalidatePath(`/e/${record.eventId}`);

        return { success: true, message: 'Record updated successfully!' };
    } catch (error) {
        console.error('Failed to update record:', error);
        return { success: false, message: 'Update failed' };
    }
}

export async function deleteRecord(recordId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const record = await Record.findByIdAndDelete(recordId);
        if (!record) return { success: false, message: 'Record not found' };

        // Revalidate to update UI
        revalidatePath(`/dashboard/event/${record.eventId}/builder`);

        return { success: true, message: 'Record deleted' };
    } catch (error) {
        console.error('Failed to delete record:', error);
        return { success: false, message: 'Delete failed' };
    }
}

export async function updateRecordById(recordId: string, data: Record<string, any>) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const record = await Record.findByIdAndUpdate(recordId, { data }, { new: true });

        revalidatePath(`/dashboard/event/${record.eventId}/builder`);
        return { success: true, message: 'Record updated' };
    } catch (error) {
        return { success: false, message: 'Update failed' };
    }
}
