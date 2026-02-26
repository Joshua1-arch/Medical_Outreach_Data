
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
    try {
        console.log('[FINAL-TEST] Sending email from verified: non-reply@reachpoint.online');
        
        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'adekunlejoshua809@gmail.com',
            subject: 'BREVO VERIFIED SENDER TEST',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #fbbf38;">Verified Sender Success</h1>
                    <p>This email was sent from <strong>non-reply@reachpoint.online</strong>.</p>
                    <p>Everything is now configured to use the Brevo REST API exclusively.</p>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            senderUsed: process.env.BREVO_SENDER_EMAIL,
            recipient: process.env.ADMIN_EMAIL,
            result
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
