
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
        const { submissionRateLimit } = require('@/lib/rate-limit');
        if (submissionRateLimit) {
            const { success } = await submissionRateLimit.limit(ip + "_forgot_password");
            if (!success) {
                return NextResponse.json({ success: false, message: 'Too many requests. Please wait a minute.' }, { status: 429 });
            }
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal if user exists (generic success message)
            // But for beta UX, maybe fine. Let's stick to standard practice: 
            // "If an account exists with this email, a reset link has been sent."
            // But we can return success: true anyway.
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, a reset link has been sent."
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Email content
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #1e293b;">Password Reset Request</h1>
                <p>You requested a password reset for your ReachPoint account.</p>
                <p>Click the link below to set a new password. This link expires in 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #1e293b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #64748b;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'ReachPoint Password Reset',
            html,
            text: `Reset your password here: ${resetUrl}`
        });

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, a reset link has been sent."
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ success: false, message: "An error occurred. Please try again." }, { status: 500 });
    }
}
