'use server';

import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Event from '@/models/Event'; // Ensure Event model is imported if needed for validation
import { revalidatePath } from 'next/cache';
import { submissionRateLimit, getIP } from '@/lib/rate-limit';
import { auth } from '@/auth';

export async function submitDonation(eventId: string, formData: any) {
    try {
        const ip = await getIP();
        const { success } = await submissionRateLimit.limit(ip + "_donation");
        if (!success) {
            return { success: false, message: 'Too many submissions. Please wait a minute.' };
        }

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
        console.error('Submit Donation Error:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}
