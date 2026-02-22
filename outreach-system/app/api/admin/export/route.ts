import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Record from "@/models/Record";
import Event from "@/models/Event"; // Ensure models are registered
import User from "@/models/User";   // Ensure models are registered
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ==================== HELPER FUNCTIONS ====================

/**
 * Flattens a nested object into a single-level object with underscore-separated keys.
 * Example: { vitals: { bp: 120, pulse: 80 } } → { vitals_bp: 120, vitals_pulse: 80 }
 */
function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};

    if (obj === null || obj === undefined) {
        return result;
    }

    for (const key of Object.keys(obj)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}_${key}` : key;

        if (Array.isArray(value)) {
            // Store arrays as-is for one-hot encoding in a later step
            result[newKey] = value;
        } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
            // Recursively flatten nested objects
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

/**
 * Collects all unique array values across all records for one-hot encoding.
 * Returns a map of field names to their unique values.
 */
function collectArrayOptions(flattenedRecords: Record<string, any>[]): Map<string, Set<string>> {
    const arrayFields = new Map<string, Set<string>>();

    for (const record of flattenedRecords) {
        for (const [key, value] of Object.entries(record)) {
            if (Array.isArray(value)) {
                if (!arrayFields.has(key)) {
                    arrayFields.set(key, new Set());
                }
                for (const item of value) {
                    if (item !== null && item !== undefined) {
                        arrayFields.get(key)!.add(String(item));
                    }
                }
            }
        }
    }

    return arrayFields;
}

/**
 * Applies one-hot encoding to array fields.
 * Converts: { symptoms: ["Fever", "Headache"] }
 * To: { symptoms_Fever: 1, symptoms_Headache: 1, symptoms_Cough: 0 }
 */
function oneHotEncode(
    record: Record<string, any>,
    arrayOptions: Map<string, Set<string>>
): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(record)) {
        if (Array.isArray(value) && arrayOptions.has(key)) {
            // One-hot encode this array field
            const options = arrayOptions.get(key)!;
            const valueSet = new Set(value.map(v => String(v)));

            for (const option of options) {
                // Sanitize option name for column header (remove special chars)
                const safeOption = option.replace(/[^a-zA-Z0-9]/g, '_');
                result[`${key}_${safeOption}`] = valueSet.has(option) ? 1 : 0;
            }
        } else if (!Array.isArray(value)) {
            // Keep non-array values as-is
            result[key] = value;
        }
    }

    return result;
}

/**
 * Escapes a value for CSV output.
 */
function escapeCSV(value: any): string {
    if (value === undefined || value === null) return "";

    const stringValue = String(value).replace(/"/g, '""'); // Escape double quotes

    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue}"`;
    }

    return stringValue;
}

// ==================== MAIN EXPORT HANDLER ====================

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

        // ==================== STEP 1: Extract and flatten all record data ====================
        const flattenedRecords: { meta: any; data: Record<string, any> }[] = [];

        for (const record of records) {
            // Extract metadata
            const meta = {
                record_id: record._id.toString(),
                event_title: record.eventId?.title || "Unknown Event",
                event_date: record.eventId?.date ? new Date(record.eventId.date).toISOString().split('T')[0] : "",
                event_location: record.eventId?.location || "",
                collected_by: record.collectedBy?.name || "Unknown",
                collector_email: record.collectedBy?.email || "",
                collection_date: new Date(record.createdAt).toISOString(),
                retrieval_code: record.retrievalCode || ""
            };

            // Flatten the dynamic data
            let rawData: any = {};
            if (record.data instanceof Map) {
                record.data.forEach((value: any, key: string) => {
                    rawData[key] = value;
                });
            } else if (record.data && typeof record.data === 'object') {
                rawData = record.data;
            }

            const flatData = flattenObject(rawData);
            flattenedRecords.push({ meta, data: flatData });
        }

        // ==================== STEP 2: Collect all unique array options ====================
        const allFlatData = flattenedRecords.map(r => r.data);
        const arrayOptions = collectArrayOptions(allFlatData);

        // ==================== STEP 3: Apply one-hot encoding ====================
        const encodedRecords = flattenedRecords.map(record => ({
            meta: record.meta,
            data: oneHotEncode(record.data, arrayOptions)
        }));

        // ==================== STEP 4: Collect all unique column names ====================
        const metaKeys = [
            "record_id",
            "event_title",
            "event_date",
            "event_location",
            "collected_by",
            "collector_email",
            "collection_date",
            "retrieval_code"
        ];

        const dataKeys = new Set<string>();
        for (const record of encodedRecords) {
            for (const key of Object.keys(record.data)) {
                dataKeys.add(key);
            }
        }
        const sortedDataKeys = Array.from(dataKeys).sort();

        // ==================== STEP 5: Build CSV ====================
        const allColumns = [...metaKeys, ...sortedDataKeys];
        const headerRow = allColumns.join(",");

        const dataRows = encodedRecords.map(record => {
            const row = allColumns.map(col => {
                if (metaKeys.includes(col)) {
                    return escapeCSV((record.meta as any)[col]);
                } else {
                    return escapeCSV(record.data[col]);
                }
            });
            return row.join(",");
        });

        const csvContent = [headerRow, ...dataRows].join("\n");

        // ==================== STEP 6: Return CSV Response ====================
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="outreach_analysis_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch {
        return new NextResponse("An error occurred. Please try again.", { status: 500 });
    }
}
