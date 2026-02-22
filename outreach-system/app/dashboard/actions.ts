'use server';

import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bcrypt from "bcryptjs";
import nodeCrypto from "crypto";

export async function createEvent(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized' };
        }

        await dbConnect();


        const user = await User.findById(session.user.id);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const reason = formData.get('reason') as string;
        const purpose = formData.get('purpose') as string;
        const date = formData.get('date') as string;
        const location = formData.get('location') as string;
        const coverImage = formData.get('coverImage') as string;
        const inventory = JSON.parse(formData.get('inventory') as string || '[]');

        if (!title || !date || !location) {
            return { success: false, message: 'Missing required fields' };
        }


        const status = (user.role === 'admin' || user.isTrusted) ? 'approved' : 'pending';

        let code = nodeCrypto.randomBytes(3).toString('hex').toUpperCase();
        let isUnique = false;
        while (!isUnique) {
            const existing = await Event.findOne({ code });
            if (!existing) isUnique = true;
            else code = nodeCrypto.randomBytes(3).toString('hex').toUpperCase();
        }

        const event = await Event.create({
            title,
            description,
            reason,
            purpose,
            date: new Date(date),
            location,
            coverImage,
            createdBy: session.user.id,
            status,
            code, // Add the unique join code
            formFields: [], // Initialize empty, managed in Builder later
            inventory, // Save inventory
        });

        revalidatePath('/dashboard/my-events');
        revalidatePath('/admin/events');

        return {
            success: true,
            message: status === 'approved'
                ? 'Event created and approved!'
                : 'Event proposal submitted! Pending admin approval.',
            eventId: event._id.toString()
        };
    } catch {
        return { success: false, message: 'Failed to create event' };
    }
}

export async function updateEventSchema(eventId: string, formFields: any[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

        await dbConnect();

        // Ensure user owns event or is admin
        const event = await Event.findById(eventId);
        if (!event) return { success: false, message: 'Event not found' };

        if (event.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        event.formFields = formFields;
        await event.save();

        revalidatePath(`/dashboard/events/${eventId}/builder`);
        revalidatePath('/dashboard/my-events');

        return { success: true, message: 'Form updated successfully' };
    } catch {
        return { success: false, message: 'Failed to update form' };
    }
}

export async function updateEventSettings(eventId: string, isPublic: boolean, accessCode: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

        await dbConnect();

        const event = await Event.findById(eventId);
        if (!event) return { success: false, message: 'Event not found' };

        // Ownership check
        if (event.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        event.isPublic = isPublic;
        event.accessCode = accessCode;
        await event.save();

        return { success: true, message: 'Settings updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update settings' };
    }
}

export async function generateMedicalReport(stats: any) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, message: 'Unauthorized' };

        if (!process.env.GOOGLE_API_KEY) {
            return { success: false, message: 'Google API Key is missing. Please add it to .env' };
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // Use a fallback strategy to find a working model
        const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
        let report = null;
        let lastError = null;

        const prompt = `You are a Chief Medical Officer analyzing aggregate health data from an outreach event. Identify public health trends, correlations, and suggest interventions. Format the response in Markdown. Data: ${JSON.stringify(stats)}`;

        for (const modelName of models) {
            try {

                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                report = response.text();

                if (report) {

                    break;
                }
            } catch (e: any) {

                lastError = e;
            }
        }

        if (!report) {
            throw lastError || new Error("All Gemini models failed to generate content.");
        }

        return { success: true, report };
    } catch (error: any) {
        console.error('Generate Report Error:', error);
        return { success: false, message: 'Failed to generate report. Please try again later.' };
    }
}

export async function changePassword(prevState: any, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'New passwords do not match' };
        }
        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('+password');

        if (!user) return { success: false, message: 'User not found' };

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return { success: false, message: 'Incorrect current password' };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return { success: true, message: 'Password changed successfully' };
    } catch {
        return { success: false, message: 'Failed to update password' };
    }
}

export async function updateUserProfile(prevState: any, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) return { success: false, message: 'User not found' };

        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const medicalRole = formData.get('medicalRole') as string;
        const profileImage = formData.get('profileImage') as string;
        const timezone = formData.get('timezone') as string;
        const exportFormat = formData.get('exportFormat') as string;

        if (name) user.name = name;
        if (phone !== null) user.phone = phone;
        if (medicalRole !== null) user.medicalRole = medicalRole;
        if (profileImage) user.profileImage = profileImage;
        if (timezone) user.timezone = timezone;
        if (exportFormat) user.exportFormat = exportFormat;

        await user.save();
        revalidatePath('/dashboard/settings');

        return { success: true, message: 'Profile updated successfully' };
    } catch {
        return { success: false, message: 'Failed to update profile' };
    }
}

export async function requestAccountDeletion() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) return { success: false, message: 'User not found' };

        user.deletionRequested = true;
        user.deletionRequestedAt = new Date();
        await user.save();

        revalidatePath('/admin/users');

        return { success: true, message: 'Your deletion request has been sent to the admin for review.' };
    } catch {
        return { success: false, message: 'Failed to submit deletion request' };
    }
}


