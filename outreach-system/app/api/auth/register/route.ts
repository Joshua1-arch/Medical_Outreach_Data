import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import InvitationCode from '@/models/InvitationCode';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';

// Strict Zod Validation (Anti-Injection)
const registerSchema = z.object({
    name: z.string().min(2).regex(/^[^<>\{\}'";]+$/, "Invalid format"),
    email: z.string().email().regex(/^[^<>\{\}'";]+$/, "Invalid format"),
    username: z.string().min(3).regex(/^[^<>\{\}'";]+$/, "Invalid format").optional(),
    password: z.string().min(6).regex(/^[^<>\{\}'";]+$/, "Invalid format"),
    invitationCode: z.string().regex(/^[^<>\{\}'";]+$/, "Invalid format").optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validationResult = registerSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({ message: 'Invalid input format' }, { status: 400 });
        }

        const validatedData = validationResult.data;

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            // Generic message to prevent enumeration (or "Invalid input format" as requested for validation failure)
            // But this is a Logic failure, not format.
            // Prompt 1 says: "If a login fails... return 'Invalid email or password'".
            // Prompt 2 says: "If validation fails, return 'Invalid input format'".
            // I'll return a generic 409 Conflict with a vague message.
            return NextResponse.json({ message: 'Resource conflict or invalid input' }, { status: 409 });
        }

        // Check if username is taken if provided
        if (validatedData.username) {
            const existingUsername = await User.findOne({ username: validatedData.username });
            if (existingUsername) {
                return NextResponse.json({ message: 'Resource conflict or invalid input' }, { status: 409 });
            }
        }

        // Handle invitation code logic
        let accountStatus = 'pending';
        let isTrusted = false;
        let usedInvitationCode = null;

        if (validatedData.invitationCode) {
            const invitationCode = await InvitationCode.findOne({
                code: validatedData.invitationCode.toUpperCase().trim(),
                isUsed: false
            });

            if (!invitationCode) {
                // "If a record isn't found... throw generic 404: 'Resource not found or access denied'"
                return NextResponse.json({
                    message: 'Resource not found or access denied'
                }, { status: 404 });
            }

            // Valid code - user gets VIP privileges
            accountStatus = 'active';
            isTrusted = true;
            usedInvitationCode = invitationCode;
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create the user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            username: validatedData.username,
            password: hashedPassword,
            role: 'user',
            accountStatus,
            isTrusted,
        });

        // Use invitation code
        if (usedInvitationCode) {
            usedInvitationCode.isUsed = true;
            usedInvitationCode.usedBy = user._id;
            usedInvitationCode.usedAt = new Date();
            await usedInvitationCode.save();
        }

        if (accountStatus === 'active') {
            // Send welcome email (non-blocking)
            sendWelcomeEmail(user.email, user.name).catch(() => { });

            return NextResponse.json({
                message: 'Registration successful! Your account is active.',
                autoApproved: true,
                isTrusted: true
            }, { status: 201 });
        }

        return NextResponse.json({
            message: 'User registered successfully. Pending approval.',
            autoApproved: false,
            isTrusted: false
        }, { status: 201 });

    } catch {
        // "An unexpected error occurred. Please try again later."
        return NextResponse.json({ message: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
    }
}
