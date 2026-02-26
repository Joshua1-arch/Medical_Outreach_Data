
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET() {
    try {
        await dbConnect();
        const email = 'adekunlejoshua809@gmail.com';
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found in DB' });
        }

        console.log('[TEST-FLOW] Triggering password reset email...');
        
        const token = crypto.randomBytes(32).toString('hex');
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;
        
        const html = `
            <div style="font-family: sans-serif; max-width: 600px;">
                <h2>Password Reset Test</h2>
                <p>This is a real flow test for ReachPoint.</p>
                <a href="${resetUrl}" style="background: #1e293b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
        `;
        
        const result = await sendEmail({
            to: email,
            subject: 'ReachPoint REAL FLOW TEST - Password Reset',
            html,
            text: `Reset your password here: ${resetUrl}`
        });

        return NextResponse.json({
            success: true,
            userFound: user.name,
            emailResult: result
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
