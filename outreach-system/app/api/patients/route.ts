import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import sanitize from 'mongo-sanitize';
import mongoose from 'mongoose';

// A mock Patient schema for the example
const PatientSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    outreachId: String
});

// Avoid model overwrite errors in development
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

/**
 * app/api/patients/route.ts
 * 
 * Sample API route demonstrating NoSQL Injection protection using mongo-sanitize.
 */
export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
        const { submissionRateLimit } = require('@/lib/rate-limit');
        if (submissionRateLimit) {
            const { success } = await submissionRateLimit.limit(ip + "_patient_reg");
            if (!success) {
                return NextResponse.json({ message: 'Rate limit exceeded. Try again later.' }, { status: 429 });
            }
        }

        await dbConnect();

        // 1. Receive the raw payload from the request
        const rawBody = await req.json();

        // 2. CRUCIAL STEP: Sanitize the data to strip any keys that start with '$'
        // This prevents an attacker from sending {"email": {"$ne": null}}
        // which could otherwise bypass authentication or extract unauthorized records.
        const sanitizedData = sanitize(rawBody);

        const { name, phone, email, outreachId } = sanitizedData;

        // 3. Use the sanitized data in your MongoDB/Mongoose methods safely.
        // findOne is particularly vulnerable to injection if the query object isn't sanitized!
        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            return NextResponse.json({ 
                message: 'Patient with this email already exists',
                success: false 
            }, { status: 400 });
        }

        // Safe insertion with sanitized properties
        const newPatient = await Patient.create({
            name,
            phone,
            email,
            outreachId
        });

        return NextResponse.json({
            message: 'Patient record created safely',
            success: true,
            data: { id: newPatient._id }
        }, { status: 201 });

    } catch (error: any) {
        console.error('[API] Patient Registration Error:', error);
        return NextResponse.json({ 
            message: 'An error occurred during processing', 
            success: false 
        }, { status: 500 });
    }
}
