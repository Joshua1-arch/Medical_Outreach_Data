import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Record from "@/models/Record";
import Event from "@/models/Event"; // Ensure models are registered
import User from "@/models/User";   // Ensure models are registered
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        // Fetch all records with populated data
        const records = await Record.find({})
            .populate('eventId', 'title location date')
            .populate('collectedBy', 'name email')
            .sort({ createdAt: -1 });

        if (!records || records.length === 0) {
            return new NextResponse("No records found", { status: 404 });
        }

        // 1. Collect all unique keys from the dynamic `data` map
        const allKeys = new Set<string>();
        records.forEach(record => {
            if (record.data) {
                // record.data is likely a Map or Object depending on Schema, assuming Object/Map
                // If it's a Mongoose Map:
                if (record.data instanceof Map) {
                    record.data.forEach((_: any, key: string) => allKeys.add(key));
                } else if (typeof record.data === 'object') {
                    Object.keys(record.data).forEach(key => allKeys.add(key));
                }
            }
        });
        const sortedKeys = Array.from(allKeys).sort();

        // 2. Build CSV Header
        const header = [
            "Record ID",
            "Event Title",
            "Event Date",
            "Collected By",
            "Collector Email",
            "Collection Date",
            "Retrieval Code",
            ...sortedKeys
        ].join(",");

        // 3. Build CSV Rows
        const rows = records.map(record => {
            const eventTitle = record.eventId?.title || "Unknown Event";
            const eventDate = record.eventId?.date ? new Date(record.eventId.date).toISOString().split('T')[0] : "";
            const collectorName = record.collectedBy?.name || "Unknown";
            const collectorEmail = record.collectedBy?.email || "";
            const collectionDate = new Date(record.createdAt).toISOString();
            const code = record.retrievalCode || "";

            const dynamicValues = sortedKeys.map(key => {
                let value = "";
                if (record.data instanceof Map) {
                    value = record.data.get(key);
                } else if (record.data && typeof record.data === 'object') {
                    value = (record.data as any)[key];
                }

                // Escape quotes and commas
                if (value === undefined || value === null) return "";
                const stringValue = String(value).replace(/"/g, '""'); // Escape double quotes
                if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            });

            return [
                record._id,
                `"${eventTitle.replace(/"/g, '""')}"`,
                eventDate,
                `"${collectorName.replace(/"/g, '""')}"`,
                collectorEmail,
                collectionDate,
                code,
                ...dynamicValues
            ].join(",");
        });

        const csvContent = [header, ...rows].join("\n");

        // 4. Return CSV Response
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="outreach_data_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
