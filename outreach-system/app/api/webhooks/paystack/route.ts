import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

/**
 * Paystack Webhook Handler
 *
 * Security: Every incoming POST is verified by re-computing the HMAC-SHA512
 * hash of the raw body with your PAYSTACK_SECRET_KEY and comparing it against
 * the x-paystack-signature header. Requests that fail this check are rejected
 * with 401 before any DB work is performed.
 *
 * Expected metadata shape set when initiating the transaction:
 *   metadata: { userId: "<mongodb _id string>" }
 */
export async function POST(req: NextRequest) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        console.error("[Paystack Webhook] PAYSTACK_SECRET_KEY is not set.");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Read raw body as text so we can hash it exactly as Paystack sent it
    const rawBody = await req.text();

    // Verify signature
    const signature = req.headers.get("x-paystack-signature");
    const expectedSignature = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

    if (signature !== expectedSignature) {
        console.warn("[Paystack Webhook] Invalid signature – request rejected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }

    // Only handle successful charges
    if (event?.event === "charge.success") {
        const userId: string | undefined = event?.data?.metadata?.userId;

        if (!userId) {
            console.warn("[Paystack Webhook] charge.success received but no userId in metadata.");
            // Still return 200 so Paystack doesn't keep retrying
            return NextResponse.json({ received: true }, { status: 200 });
        }

        try {
            await dbConnect();
            const updated = await User.findByIdAndUpdate(
                userId,
                { $set: { isPremium: true } },
                { new: true }
            );

            if (!updated) {
                console.warn(`[Paystack Webhook] No user found for id: ${userId}`);
            } else {
                console.log(`[Paystack Webhook] User ${userId} upgraded to premium.`);
            }
        } catch (err) {
            console.error("[Paystack Webhook] DB error while upgrading user:", err);
            // Return 500 so Paystack retries
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    // Acknowledge all other events with 200 so Paystack stops retrying them
    return NextResponse.json({ received: true }, { status: 200 });
}
