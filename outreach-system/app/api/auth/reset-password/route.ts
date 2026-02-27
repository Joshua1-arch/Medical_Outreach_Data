
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword || typeof token !== 'string' || typeof newPassword !== 'string') {
            return NextResponse.json({ success: false, message: "Invalid or missing token and password" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
        const { submissionRateLimit } = require('@/lib/rate-limit');
        if (submissionRateLimit) {
            const { success } = await submissionRateLimit.limit(ip + "_reset_password");
            if (!success) {
                return NextResponse.json({ success: false, message: 'Too many requests. Please wait a minute.' }, { status: 429 });
            }
        }

        await dbConnect();

        // Find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid or expired password reset token" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch {
        return NextResponse.json({ success: false, message: "An error occurred. Please try again." }, { status: 500 });
    }
}
