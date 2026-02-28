import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Pusher from "pusher";
import { auth } from "@/auth";

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

// Lightweight HTML Sanitizer to strip tags and prevent XSS
const sanitizeHtml = (str: string) => {
    if (!str) return str;
    return str.replace(/(<([^>]+)>)/gi, "").trim();
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(); // Verify user session if admin
    await dbConnect();

    const { id } = await params;
    const eventId = id;
    let { text, senderName, role } = await req.json();

    if (!text || !senderName || !role) {
       return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    // Strip HTML to prevent execution of malicious scripts (XSS)
    text = sanitizeHtml(text);
    senderName = sanitizeHtml(senderName);

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

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("POST Chat Error:", error);
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}
