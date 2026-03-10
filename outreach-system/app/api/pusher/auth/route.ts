import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";
import { auth } from "@/auth";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channelName = data.get("channel_name") as string;

    if (!socketId || !channelName) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // ── Security: private-user-* channels require the session user to own it
    if (channelName.startsWith("private-user-")) {
      const channelUserId = channelName.replace("private-user-", "");
      if (!session?.user?.id || session.user.id !== channelUserId) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher Auth Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
