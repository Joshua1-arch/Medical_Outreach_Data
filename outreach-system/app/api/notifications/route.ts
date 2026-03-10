import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

// GET /api/notifications — fetch the 30 most recent for the current user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        return NextResponse.json({
            notifications: notifications.map((n: any) => ({
                _id: n._id.toString(),
                type: n.type,
                title: n.title,
                message: n.message,
                eventId: n.eventId,
                isRead: n.isRead,
                createdAt: n.createdAt,
            })),
            unreadCount: notifications.filter((n: any) => !n.isRead).length,
        });
    } catch (err) {
        console.error('[notifications] GET error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PATCH /api/notifications — mark ALL notifications as read
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        await Notification.updateMany(
            { userId: session.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[notifications] PATCH error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
