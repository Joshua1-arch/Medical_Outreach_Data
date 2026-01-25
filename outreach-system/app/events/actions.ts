'use server';

import dbConnect from "@/lib/db";
import Record from "@/models/Record";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import Event from "@/models/Event";

function generateRetrievalCode() {
    // Generate a 6-character alphanumeric code (e.g., A7X92B)
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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

        await Record.create({
            eventId,
            data,
            recordedBy,
            retrievalCode
        });

        revalidatePath(`/events/${eventId}/enter-data`);
        revalidatePath(`/e/${eventId}`);

        return { success: true, message: 'Record saved successfully!', code: retrievalCode };
    } catch (error) {
        console.error('Failed to submit record:', error);
        return { success: false, message: 'Failed to save record' };
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
