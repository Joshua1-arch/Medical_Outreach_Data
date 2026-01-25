'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import AuditLog from "@/models/AuditLog";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Helper for audit logging
async function logAudit(action: string, targetResource: string, details: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) return;

        await AuditLog.create({
            action,
            performedBy: session.user.id,
            targetResource,
            details
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
}

// Check admin permission helper
async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

export async function approveUser(userId: string) {
    try {
        await checkAdmin();
        await dbConnect();
        const user = await User.findByIdAndUpdate(userId, { accountStatus: 'active' }, { new: true });
        revalidatePath('/admin/users');
        await logAudit('USER_APPROVED', `User:${userId}`, { email: user?.email });
        return { success: true, message: 'User approved' };
    } catch (error) {
        console.error('Failed to approve user:', error);
        return { success: false, message: 'Failed to approve user' };
    }
}

export async function rejectUser(userId: string) {
    try {
        await checkAdmin();
        await dbConnect();
        const user = await User.findByIdAndUpdate(userId, { accountStatus: 'rejected' }, { new: true });
        revalidatePath('/admin/users');
        await logAudit('USER_REJECTED', `User:${userId}`, { email: user?.email });
        return { success: true, message: 'User rejected' };
    } catch (error) {
        console.error('Failed to reject user:', error);
        return { success: false, message: 'Failed to reject user' };
    }
}

export async function toggleUserStatus(userId: string, newStatus: string) {
    const validStatuses = ['active', 'suspended', 'rejected', 'pending'];
    if (!validStatuses.includes(newStatus)) {
        return { success: false, message: 'Invalid status' };
    }

    try {
        await checkAdmin();
        await dbConnect();

        // Find first to get old status
        const oldUser = await User.findById(userId);
        if (!oldUser) return { success: false, message: 'User not found' };

        const user = await User.findByIdAndUpdate(userId, { accountStatus: newStatus }, { new: true });
        revalidatePath('/admin/users');

        await logAudit('USER_STATUS_CHANGE', `User:${userId}`, {
            oldStatus: oldUser.accountStatus,
            newStatus,
            email: user?.email
        });

        return { success: true, message: `User status updated to ${newStatus}` };
    } catch (error) {
        console.error('Failed to update user status:', error);
        return { success: false, message: 'Failed to update user status' };
    }
}

export async function deleteUser(userId: string) {
    try {
        await checkAdmin();
        await dbConnect();
        const user = await User.findByIdAndDelete(userId);
        revalidatePath('/admin/users');
        await logAudit('USER_DELETED', `User:${userId}`, { email: user?.email });
        return { success: true, message: 'User deleted' };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: 'Failed to delete user' };
    }
}

export async function approveEvent(eventId: string) {
    try {
        await checkAdmin();
        await dbConnect();
        await Event.findByIdAndUpdate(eventId, { status: 'approved' });
        revalidatePath('/admin/events');
        await logAudit('EVENT_APPROVED', `Event:${eventId}`, {});
        return { success: true, message: 'Event approved' };
    } catch (error) {
        console.error('Failed to approve event:', error);
        return { success: false, message: 'Failed to approve event' };
    }
}

export async function deleteEvent(eventId: string) {
    try {
        await checkAdmin();
        await dbConnect();
        const event = await Event.findByIdAndDelete(eventId);
        revalidatePath('/admin/events');
        await logAudit('EVENT_DELETED', `Event:${eventId}`, { title: event?.title });
        return { success: true, message: 'Event deleted' };
    } catch (error) {
        console.error('Failed to delete event:', error);
        return { success: false, message: 'Failed to delete event' };
    }
}

export async function updateEvent(eventId: string, data: any) {
    try {
        await checkAdmin();
        await dbConnect();
        const event = await Event.findByIdAndUpdate(eventId, data, { new: true });
        revalidatePath('/admin/events');
        await logAudit('EVENT_UPDATED', `Event:${eventId}`, { updates: Object.keys(data) });
        return { success: true, message: 'Event updated' };
    } catch (error) {
        console.error('Failed to update event:', error);
        return { success: false, message: 'Failed to update event' };
    }
}
