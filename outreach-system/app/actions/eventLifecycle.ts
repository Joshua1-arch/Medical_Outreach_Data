'use server';

import { requireServerActionAuth } from "@/lib/withAuth";
import Event from "@/models/Event";
import { revalidatePath, revalidateTag } from "next/cache";
import dbConnect from "@/lib/db";

export async function markEventCompleted(eventId: string) {
    try {
        await dbConnect();
        const { user } = await requireServerActionAuth();
        const event = await Event.findById(eventId);
        
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        const isAdmin = user.role === 'admin';
        const isCreator = event.createdBy.toString() === user.id;

        if (!isAdmin && !isCreator) {
            return { success: false, message: "Insufficient permissions: Only Admins or the Creator can complete an event." };
        }

        event.isCompleted = true;
        await event.save();

        // Revalidate the dashboard and public views
        revalidatePath(`/dashboard/event/${eventId}`);
        revalidatePath(`/e/${eventId}`);
        revalidatePath(`/dashboard/my-events`); // ✅ Revalidate overview card list
        revalidateTag('event-stats');


        return { success: true, message: "Event marked as completed" };
    } catch (error: any) {
        console.error("[EVENT_COMPLETION_ERROR]:", error); // 🔧 Diagnostic logs
        const errorMessage = typeof error === 'object' && error?.message ? error.message : "Failed to complete event";
        return { success: false, message: errorMessage };
    }
}
