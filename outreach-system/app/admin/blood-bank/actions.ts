'use server';

import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import { auth } from '@/auth';

export async function searchCompatibleDonors(targetBloodType: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        await dbConnect();

        // Query: Find detailed donors where the target blood type is in their compatible recipients list
        // AND they are marked as fit to donate.

        // normalize input just in case e.g "A+"
        const type = targetBloodType.trim();

        const donors = await Donation.find({
            isFitToDonate: true,
            compatibleRecipients: type
        }).sort({ createdAt: -1 }).lean();

        // Convert _id to string for serialization
        const serializedDonors = donors.map((donor: any) => ({
            ...donor,
            _id: donor._id.toString(),
            eventId: donor.eventId.toString(),
            createdAt: donor.createdAt.toISOString(),
            updatedAt: donor.updatedAt.toISOString(),
        }));

        return { success: true, donors: serializedDonors };
    } catch (error: any) {
        console.error('Error searching donors:', error);
        return { success: false, message: 'Failed to search donors.' };
    }
}
