import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const EXPECTED_AMOUNT_KOBO = 1_000_000; // ₦10,000

/**
 * POST /api/verify-payment
 * Body: { reference: string }
 *
 * 1. Authenticates the caller via the NextAuth session.
 * 2. Calls Paystack's transaction verify endpoint server-to-server.
 * 3. Confirms the status is "success" and amount matches.
 * 4. Sets isPremium = true on the user document.
 *
 * This endpoint works in local dev (no public webhook URL needed).
 * The webhook at /api/webhooks/paystack remains as a redundant safety net
 * for cases where the client closes the browser before this call completes.
 */
export async function POST(req: NextRequest) {
    // ── Auth check ────────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const reference: string | undefined = body?.reference;
    if (!reference) {
        return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        console.error("[verify-payment] PAYSTACK_SECRET_KEY is not set.");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // ── Verify with Paystack ──────────────────────────────────────────────────
    let paystackData: any;
    try {
        const res = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${secret}`,
                    "Content-Type": "application/json",
                },
                // Next.js: don't cache this – it must be fresh every time
                cache: "no-store",
            }
        );
        paystackData = await res.json();
    } catch (err) {
        console.error("[verify-payment] Failed to reach Paystack API:", err);
        return NextResponse.json({ error: "Could not contact payment provider" }, { status: 502 });
    }

    // ── Validate the response ─────────────────────────────────────────────────
    if (!paystackData?.status || paystackData.data?.status !== "success") {
        console.warn("[verify-payment] Payment not successful:", paystackData?.data?.status);
        return NextResponse.json(
            { error: "Payment was not successful", paystackStatus: paystackData?.data?.status },
            { status: 402 }
        );
    }

    if (paystackData.data.amount < EXPECTED_AMOUNT_KOBO) {
        console.warn(
            `[verify-payment] Amount mismatch: got ${paystackData.data.amount}, expected ${EXPECTED_AMOUNT_KOBO}`
        );
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 402 });
    }

    // ── Upgrade the user ──────────────────────────────────────────────────────
    try {
        await dbConnect();
        await User.findByIdAndUpdate(
            session.user.id,
            { $set: { isPremium: true } },
            { new: true }
        );
        console.log(`[verify-payment] User ${session.user.id} upgraded to premium. Ref: ${reference}`);
    } catch (err) {
        console.error("[verify-payment] DB update failed:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
