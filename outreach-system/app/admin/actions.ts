'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import AuditLog from "@/models/AuditLog";
import InvitationCode from "@/models/InvitationCode";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import crypto from "crypto";
import { sendUserApprovalEmail, sendEventApprovalEmail, sendUserRejectionEmail, sendEventRejectionEmail } from "@/lib/email";

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

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        revalidatePath('/admin/users');
        await logAudit('USER_APPROVED', `User:${userId}`, { email: user.email });

        // Send approval email (non-blocking)
        sendUserApprovalEmail(user.email, user.name).catch(err =>
            console.error('Failed to send approval email:', err)
        );

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

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        revalidatePath('/admin/users');
        await logAudit('USER_REJECTED', `User:${userId}`, { email: user.email });

        // Send rejection email (non-blocking)
        sendUserRejectionEmail(user.email, user.name).catch(err =>
            console.error('Failed to send rejection email:', err)
        );

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

        // Send status change emails (non-blocking)
        if (newStatus === 'active' && oldUser.accountStatus !== 'active') {
            sendUserApprovalEmail(user.email, user.name).catch(err =>
                console.error('Failed to send status active email:', err)
            );
        } else if (newStatus === 'rejected' && oldUser.accountStatus !== 'rejected') {
            sendUserRejectionEmail(user.email, user.name).catch(err =>
                console.error('Failed to send status rejection email:', err)
            );
        }

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

        // Get event and populate creator info before updating
        const event = await Event.findById(eventId).populate('createdBy', 'name email');

        if (!event) {
            return { success: false, message: 'Event not found' };
        }

        // Update event status
        await Event.findByIdAndUpdate(eventId, { status: 'approved' });
        revalidatePath('/admin/events');
        await logAudit('EVENT_APPROVED', `Event:${eventId}`, { title: event.title });

        // Send approval email to event creator (non-blocking)
        if (event.createdBy && typeof event.createdBy === 'object' && 'email' in event.createdBy) {
            sendEventApprovalEmail(
                event.createdBy.email,
                event.createdBy.name,
                event.title
            ).catch(err => console.error('Failed to send event approval email:', err));
        }

        return { success: true, message: 'Event approved' };
    } catch (error) {
        console.error('Failed to approve event:', error);
        return { success: false, message: 'Failed to approve event' };
    }
}

export async function rejectEvent(eventId: string) {
    try {
        await checkAdmin();
        await dbConnect();

        // Get event and populate creator info
        const event = await Event.findById(eventId).populate('createdBy', 'name email');

        if (!event) {
            return { success: false, message: 'Event not found' };
        }

        // Update event status
        await Event.findByIdAndUpdate(eventId, { status: 'rejected' });
        revalidatePath('/admin/events');
        await logAudit('EVENT_REJECTED', `Event:${eventId}`, { title: event.title });

        // Send rejection email to event creator (non-blocking)
        if (event.createdBy && typeof event.createdBy === 'object' && 'email' in event.createdBy) {
            sendEventRejectionEmail(
                event.createdBy.email,
                event.createdBy.name,
                event.title
            ).catch(err => console.error('Failed to send event rejection email:', err));
        }

        return { success: true, message: 'Event rejected' };
    } catch (error) {
        console.error('Failed to reject event:', error);
        return { success: false, message: 'Failed to reject event' };
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

// ==================== INVITATION CODE ACTIONS ====================

function generateCodeString(): string {
    // Generate a 10-character alphanumeric code in format XXXX-XXXX-XX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXXX-XXXX-XX
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 10)}`;
}

export async function generateInvitationCodes(count: number = 1) {
    try {
        const session = await checkAdmin();
        await dbConnect();

        // Validate count (1-50 codes max per request)
        const safeCount = Math.min(Math.max(1, count), 50);
        const generatedCodes: string[] = [];

        for (let i = 0; i < safeCount; i++) {
            // Generate a unique code
            let code = generateCodeString();
            let attempts = 0;

            // Ensure uniqueness
            while (await InvitationCode.findOne({ code }) && attempts < 10) {
                code = generateCodeString();
                attempts++;
            }

            const invitationCode = await InvitationCode.create({
                code,
                isUsed: false,
                generatedBy: session.user.id
            });

            generatedCodes.push(invitationCode.code);
        }

        revalidatePath('/admin');
        await logAudit('INVITATION_CODES_GENERATED', `Count:${safeCount}`, {
            count: safeCount,
            codes: generatedCodes
        });

        return {
            success: true,
            codes: generatedCodes,
            count: generatedCodes.length,
            message: `${generatedCodes.length} invitation code(s) generated successfully`
        };
    } catch (error) {
        console.error('Failed to generate invitation codes:', error);
        return { success: false, codes: [], message: 'Failed to generate invitation codes' };
    }
}

export async function getActiveInvitationCodes() {
    try {
        await checkAdmin();
        await dbConnect();

        const codes = await InvitationCode.find({ isUsed: false })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Serialize the data
        const serializedCodes = codes.map((code: any) => ({
            _id: code._id.toString(),
            code: code.code,
            createdAt: code.createdAt.toISOString(),
        }));

        return { success: true, codes: serializedCodes };
    } catch (error) {
        console.error('Failed to fetch invitation codes:', error);
        return { success: false, codes: [] };
    }
}

export async function getUsedInvitationCodes() {
    try {
        await checkAdmin();
        await dbConnect();

        const codes = await InvitationCode.find({ isUsed: true })
            .populate('usedBy', 'name email')
            .sort({ usedAt: -1 })
            .limit(50)
            .lean();

        // Serialize the data
        const serializedCodes = codes.map((code: any) => ({
            _id: code._id.toString(),
            code: code.code,
            createdAt: code.createdAt.toISOString(),
            usedAt: code.usedAt ? code.usedAt.toISOString() : null,
            usedBy: code.usedBy ? {
                name: code.usedBy.name,
                email: code.usedBy.email
            } : null
        }));

        return { success: true, codes: serializedCodes };
    } catch (error) {
        console.error('Failed to fetch used invitation codes:', error);
        return { success: false, codes: [] };
    }
}

export async function deleteInvitationCode(codeId: string) {
    try {
        await checkAdmin();
        await dbConnect();

        const code = await InvitationCode.findByIdAndDelete(codeId);

        if (!code) {
            return { success: false, message: 'Code not found' };
        }

        revalidatePath('/admin');
        await logAudit('INVITATION_CODE_DELETED', `Code:${code.code}`, { code: code.code });

        return { success: true, message: 'Invitation code deleted' };
    } catch (error) {
        console.error('Failed to delete invitation code:', error);
        return { success: false, message: 'Failed to delete invitation code' };
    }
}
