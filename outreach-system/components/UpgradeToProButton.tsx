"use client";

import { usePaystackPayment } from "react-paystack";

interface UpgradeToProButtonProps {
    email: string;
    userId: string;
}

/**
 * Renders a one-time Paystack payment button for the Premium PDF Export upgrade.
 *
 * Amount: ₦10,000 — passed as 1,000,000 kobo (Paystack always expects kobo).
 * The userId is embedded in the transaction metadata so the webhook at
 * /api/webhooks/paystack can flip isPremium=true on the correct user document.
 */
export default function UpgradeToProButton({ email, userId }: UpgradeToProButtonProps) {
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

    const config = {
        reference: `reachpoint_${userId}_${Date.now()}`,
        email,
        amount: 1_000_000, // 1,000,000 kobo = ₦10,000
        publicKey: paystackPublicKey,
        metadata: {
            // Paystack passes this object back verbatim in the webhook payload.
            // The webhook extracts data.metadata.userId to find the DB user.
            userId,
            custom_fields: [
                {
                    display_name: "User ID",
                    variable_name: "user_id",
                    value: userId,
                },
            ],
        },
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = async (response: any) => {
        const reference: string = response?.reference ?? config.reference;

        try {
            const res = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Hard reload so NextAuth re-issues the session with isPremium=true
                alert("🎉 Payment verified! Your account is now upgraded to Pro.");
                window.location.reload();
            } else {
                alert(
                    `Payment was received but verification failed: ${data.error ?? "Unknown error"}.\n` +
                    "Please contact support with reference: " + reference
                );
            }
        } catch (err) {
            console.error("[UpgradeToProButton] Verification call failed:", err);
            alert(
                "Payment succeeded but we could not verify it right now.\n" +
                "Please refresh the page in a moment. If the issue persists, contact support with reference: " + reference
            );
        }
    };

    const onClose = () => {
        console.log("Paystack payment dialog closed.");
    };

    return (
        <button
            type="button"
            onClick={() => initializePayment({ onSuccess, onClose })}
            className="
                inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400
                text-gray-900 shadow-md shadow-amber-200
                hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300
                hover:shadow-lg hover:shadow-amber-300 hover:-translate-y-0.5
                active:scale-95
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            "
        >
            {/* Crown icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
            >
                <path
                    fillRule="evenodd"
                    d="M10 1.5l2.5 5 5.5.8-4 3.9.95 5.5L10 14.25l-4.95 2.45.95-5.5-4-3.9 5.5-.8L10 1.5z"
                    clipRule="evenodd"
                />
            </svg>
            Upgrade to Pro (₦10,000)
        </button>
    );
}
