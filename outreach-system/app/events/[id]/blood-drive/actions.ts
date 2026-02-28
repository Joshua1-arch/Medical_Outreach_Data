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

        const session = await auth();
        await dbConnect();

        const event = await Event.findById(eventId);
        if (!event) return { success: false, message: 'Event not found' };

        let recordedBy = undefined;

        if (event.isPublic) {
            recordedBy = session?.user?.id;
        } else {
            if (!session?.user?.id) {
                return { success: false, message: 'Unauthorized: You must be logged in to submit to a private event.' };
            }
            recordedBy = session.user.id;
        }

        const newDonation = new Donation({
            eventId,
            recordedBy,
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
