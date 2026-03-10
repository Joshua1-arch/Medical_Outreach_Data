import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Event from "@/models/Event";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Pusher from "pusher";
import { auth } from "@/auth";
import { sanitizeChatMessage } from "@/lib/sanitize";
import { isValidObjectId, stripMongoOperators, ensureString } from "@/lib/nosql-sanitize";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Validate ObjectId to prevent injection via URL params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid event ID." }, { status: 400 });
    }

    const eventId = id;

    // Fetch last 50 messages to prevent overload
    const messages = await Message.find({ eventId })
      .sort({ timestamp: 1 }) // oldest first (or adjust depending on UI needs)
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("GET Chat Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch messages." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(); // Verify user session if admin
    await dbConnect();

    const { id } = await params;

    // Validate ObjectId to prevent injection via URL params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid event ID." }, { status: 400 });
    }

    const eventId = id;

    // Strip NoSQL operators from the request body
    const rawBody = await req.json();
    const safeBody = stripMongoOperators(rawBody);

    let text = ensureString(safeBody.text);
    let senderName = ensureString(safeBody.senderName);
    const role = ensureString(safeBody.role);

    if (!text || !senderName || !role) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    // Sanitize with DOMPurify (strips all HTML, enforces max length)
    text = sanitizeChatMessage(text);
    senderName = sanitizeChatMessage(senderName, 100);

    if (!text) {
      return NextResponse.json({ success: false, message: "Message cannot be empty." }, { status: 400 });
    }

    const newMessage = await Message.create({
      eventId,
      text,
      senderName,
      role,
    });

    // Trigger pusher event to private channel
    await pusher.trigger(`private-event-${eventId}`, "message", {
      _id: newMessage._id,
      eventId: newMessage.eventId,
      text: newMessage.text,
      senderName: newMessage.senderName,
      role: newMessage.role,
      timestamp: newMessage.timestamp,
    });

    // Handle notifications
    try {
      const event = await Event.findById(eventId);
      if (event) {
        if (role === 'admin') {
          // Notify the event creator
          if (session?.user?.id !== event.createdBy.toString()) {
            await Notification.create({
              userId: event.createdBy.toString(),
              type: 'message',
              title: `New Message: ${event.title}`,
              message: `You have a new message from ${senderName}.`,
              eventId: eventId,
            });
            await pusher.trigger(`private-user-${event.createdBy.toString()}`, 'new-notification', {});
          }
        } else {
          // Volunteer sent a message.
          // 1. Notify the event creator
          const creatorId = event.createdBy.toString();
          await Notification.create({
            userId: creatorId,
            type: 'message',
            title: `New Message: ${event.title}`,
            message: `You have a new message from ${senderName}.`,
            eventId: eventId,
          });
          await pusher.trigger(`private-user-${creatorId}`, 'new-notification', {});

          // 2. Notify admins (excluding the creator if they happen to be an admin)
          const admins = await User.find({ role: 'admin' }).select('_id');
          const otherAdmins = admins.filter(admin => admin._id.toString() !== creatorId);

          if (otherAdmins.length > 0) {
            const adminNotifications = otherAdmins.map(admin => ({
              userId: admin._id.toString(),
              type: 'message',
              title: `New Event Message: ${event.title}`,
              message: `New message from ${senderName}.`,
              eventId: eventId,
            }));
            await Notification.insertMany(adminNotifications);

            // Trigger pusher for all other admins
            for (const admin of otherAdmins) {
              await pusher.trigger(`private-user-${admin._id.toString()}`, 'new-notification', {});
            }
          }
        }
      }
    } catch (notifError) {
      console.error("Notification creation failed:", notifError);
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("POST Chat Error:", error);
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}

