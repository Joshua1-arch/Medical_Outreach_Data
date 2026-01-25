import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        await dbConnect();

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: 'user', // Default
            accountStatus: 'pending', // Default
        });

        return NextResponse.json({ message: 'User registered successfully. Pending approval.' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Invalid data', errors: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
