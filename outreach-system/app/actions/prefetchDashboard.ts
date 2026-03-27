'use server';

import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Record from "@/models/Record";
import Message from "@/models/Message";
import { auth } from "@/auth";

export async function prefetchDashboard() {
    try {
        const session = await auth();
        
        // Ensure user is an admin or authorized to fetch heavy payload
        if (session?.user?.role !== 'admin') {
            return {
                success: false,
                data: null
            };
        }

        await dbConnect();

        // Perform parallel queries to prevent thread blocking
        // We use .lean() to guarantee native JSON serialization across the network
        const [rawEvents, rawResponses, rawMessages] = await Promise.all([
            Event.find({}).sort({ createdAt: -1 }).lean(),
            Record.find({}).sort({ createdAt: -1 }).lean(),
            Message.find({}).sort({ createdAt: -1 }).lean()
        ]);

        // Convert ObjIds to strings manually because MongoDB ObjectIds can't be passed to Client Components
        const events = JSON.parse(JSON.stringify(rawEvents));
        const responses = JSON.parse(JSON.stringify(rawResponses));
        const chatHistory = JSON.parse(JSON.stringify(rawMessages));

        return {
            success: true,
            data: {
                events,
                responses,
                analytics: [], // Can compute complex analytics here, or process on the client
                forms: [], // Populate form specific arrays if needed
                chatHistory
            }
        };

    } catch (error) {
        console.error("Failed to prefetch dashboard:", error);
        return {
            success: false,
            data: null
        };
    }
}
