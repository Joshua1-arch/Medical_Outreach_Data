import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import RecordModel from '@/models/Record';
import { unstable_cache } from 'next/cache';

import { auth } from '@/auth';

const getCachedAnalytics = unstable_cache(
    async (id: string) => {
        await dbConnect();
        
        const event = await Event.findById(id).lean();
        if (!event) return null;

        const records = await RecordModel.find({ eventId: id }).lean();

        // --- KPI CALCULATIONS ---
        const totalPatients = records.length;

        // Last Entry
        let lastEntryTime = null;
        if (records.length > 0) {
            const sortedByDate = [...records].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            if (sortedByDate[0].createdAt) {
                lastEntryTime = new Date(sortedByDate[0].createdAt).toISOString();
            }
        }

        // Completion Rate
        const requiredFields = (event.formFields || []).filter((f: any) => f.required).length;
        const completedCount = records.filter((r: any) => {
            if (!r.data) return false;
            const filledRequired = (event.formFields || []).filter((f: any) => f.required && r.data[f.label]).length;
            return filledRequired === requiredFields;
        }).length;
        const completionRate = totalPatients > 0 ? Math.round((completedCount / totalPatients) * 100) : 0;

        // --- DYNAMIC FIELD ANALYSIS ---
        const fieldAnalysis = (event.formFields || []).map((field: any) => {
            if (['select', 'radio', 'checkbox', 'text'].includes(field.type)) {
                const counts: Record<string, number> = {};
                let validResponses = 0;

                records.forEach((r: any) => {
                    const val = r.data?.[field.label];
                    if (val) {
                        counts[val] = (counts[val] || 0) + 1;
                        validResponses++;
                    }
                });

                const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

                return {
                    id: field.label,
                    label: field.label,
                    type: 'categorical',
                    totalResponses: validResponses,
                    data
                };
            }

            if (field.type === 'number') {
                const values = records
                    .map((r: any) => parseFloat(r.data?.[field.label]))
                    .filter((v: number) => !isNaN(v));

                if (values.length === 0) {
                    return {
                        id: field.label,
                        label: field.label,
                        type: 'numerical',
                        stats: null
                    };
                }

                const sum = values.reduce((a: number, b: number) => a + b, 0);
                const avg = sum / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);

                return {
                    id: field.label,
                    label: field.label,
                    type: 'numerical',
                    stats: {
                        average: avg,
                        min,
                        max
                    }
                };
            }

            return null;
        }).filter(Boolean);

        return {
            kpis: {
                totalPatients,
                completionRate,
                lastEntry: lastEntryTime
            },
            fields: fieldAnalysis,
            createdBy: event.createdBy ? String(event.createdBy) : null
        };
    },
    ['event-analytics-cache'],
    { tags: ['event-stats'], revalidate: 60 }
);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
        const { submissionRateLimit } = require('@/lib/rate-limit');
        if (submissionRateLimit) {
            const { success } = await submissionRateLimit.limit(ip + "_analytics");
            if (!success) {
                return NextResponse.json({ success: false, message: 'Too many analytics requests. Please wait a minute.' }, { status: 429 });
            }
        }

        const { id } = await params;
        const { isValidObjectId } = require('@/lib/nosql-sanitize');
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
        }
        
        const data = await getCachedAnalytics(id);
        
        if (!data) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }
        
        if (session.user.role !== 'admin' && data.createdBy !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized: You do not have permission to view this event\'s analytics' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            kpis: data.kpis,
            fields: data.fields
        });

    } catch (e) {
        return NextResponse.json({ success: false, message: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
