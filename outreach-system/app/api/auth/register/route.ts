import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import InvitationCode from '@/models/InvitationCode';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    invitationCode: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // Handle invitation code logic
        let accountStatus = 'pending';
        let isTrusted = false;
        let usedInvitationCode = null;

        if (validatedData.invitationCode) {
            // User provided an invitation code - validate it
            const invitationCode = await InvitationCode.findOne({
                code: validatedData.invitationCode.toUpperCase().trim(),
                isUsed: false
            });

            if (!invitationCode) {
                return NextResponse.json({
                    message: 'Invalid or expired invitation code. Please check the code or leave it blank to proceed with standard registration.'
                }, { status: 400 });
            }

            // Valid code - user gets VIP privileges
            accountStatus = 'active';    // Instant login
            isTrusted = true;            // VIP status - events auto-approved
            usedInvitationCode = invitationCode;
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create the user with VIP status if applicable
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: 'user',
            accountStatus,
            isTrusted,
        });

        // If invitation code was used, mark it as used (burn the code)
        if (usedInvitationCode) {
            usedInvitationCode.isUsed = true;
            usedInvitationCode.usedBy = user._id;
            usedInvitationCode.usedAt = new Date();
            await usedInvitationCode.save();
        }

        // Return appropriate message based on account status
        if (accountStatus === 'active') {
            // Send welcome email to users who used invitation codes (non-blocking)
            sendWelcomeEmail(user.email, user.name).catch(err =>
                console.error('Failed to send welcome email:', err)
            );

            return NextResponse.json({
                message: 'Registration successful! Your account is active with Trusted Creator privileges. You can now log in.',
                autoApproved: true,
                isTrusted: true
            }, { status: 201 });
        }

        return NextResponse.json({
            message: 'User registered successfully. Pending approval.',
            autoApproved: false,
            isTrusted: false
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Invalid data', errors: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
