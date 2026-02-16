'use server';

import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Event from '@/models/Event'; // Ensure Event model is imported if needed for validation
import { revalidatePath } from 'next/cache';

export async function submitDonation(eventId: string, formData: any) {
    try {
        await dbConnect();

        // Basic validation could go here, but the Schema handles most of the heavy lifting including the logic gates for fitness.

        const newDonation = new Donation({
            eventId,
            ...formData
        });

        await newDonation.save();

        revalidatePath(`/events/${eventId}/blood-drive`);

        return { success: true, message: 'Donation record created successfully.', donationId: newDonation._id.toString() };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to submit donation.' };
    }
}
