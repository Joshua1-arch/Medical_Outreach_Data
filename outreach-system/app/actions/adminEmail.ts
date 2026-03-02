'use server';

import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendNewsletterBlast(subject: string, htmlMessage: string) {
    try {
        if (typeof subject !== 'string' || typeof htmlMessage !== 'string') {
            return { success: false, message: 'Invalid payload format' };
        }

        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return { success: false, message: 'Unauthorized. Admins only.' };
        }

        const { submissionRateLimit, getIP } = require('@/lib/rate-limit');
        const ip = await getIP();
        const { success: rateLimitSuccess } = await submissionRateLimit.limit(ip + "_admin_blast");
        if (!rateLimitSuccess) {
            return { success: false, message: 'Too many requests. Please try again later.' };
        }

        if (!subject || !htmlMessage) {
            return { success: false, message: 'Subject and message are required.' };
        }

        await dbConnect();
        const subscribers = await Subscriber.find({}, 'email').lean();
        
        if (!subscribers || subscribers.length === 0) {
            return { success: false, message: 'No subscribers found.' };
        }

        const emails = subscribers.map((sub: any) => sub.email);
        
        // Loop and send individually to protect subscriber privacy
        const emailPromises = emails.map(email => 
            sendEmail({
                to: email,
                subject: subject,
                html: htmlMessage, 
            })
        );
        
        await Promise.allSettled(emailPromises);

        return { success: true, message: `Newsletter successfully sent to ${emails.length} subscriber(s).` };
    } catch (error) {
        console.error("Admin Email Blast Error:", error);
        return { success: false, message: 'Failed to send newsletter.' };
    }
}

export async function removeSubscriber(subscriberId: string) {
    try {
        if (typeof subscriberId !== 'string') {
            return { success: false, message: 'Invalid ID format.' };
        }

        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return { success: false, message: 'Unauthorized. Admins only.' };
        }

        const { submissionRateLimit, getIP } = require('@/lib/rate-limit');
        const ip = await getIP();
        const { success: rateLimitSuccess } = await submissionRateLimit.limit(ip + "_admin_remove_sub");
        if (!rateLimitSuccess) {
            return { success: false, message: 'Too many requests. Please try again later.' };
        }

        if (!subscriberId) {
            return { success: false, message: 'Subscriber ID is required.' };
        }

        await dbConnect();
        
        const result = await Subscriber.findByIdAndDelete(subscriberId);
        
        if (!result) {
            return { success: false, message: 'Subscriber not found.' };
        }

        revalidatePath('/admin/newsletter');

        return { success: true, message: 'Subscriber removed successfully.' };
    } catch (error) {
        console.error("Remove Subscriber Error:", error);
        return { success: false, message: 'Failed to remove subscriber.' };
    }
}
