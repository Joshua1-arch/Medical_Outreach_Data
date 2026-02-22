import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import RecordModel from '@/models/Record'; // Renamed to avoid reserved word conflict if needed, though 'Record' is TS type usually.

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        const records = await RecordModel.find({ eventId: id });

        // --- KPI CALCULATIONS ---
        const totalPatients = records.length;

        // Last Entry
        let lastEntryTime = null;
        if (records.length > 0) {
            const sortedByDate = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            lastEntryTime = sortedByDate[0].createdAt;
        }

        // Completion Rate (Approximation: Number of records with data keys >= number of required fields)
        const requiredFields = event.formFields.filter((f: any) => f.required).length;
        const completedCount = records.filter((r: any) => {
            if (!r.data) return false;
            // Count how many required fields have values
            const filledRequired = event.formFields.filter((f: any) => f.required && r.data[f.label]).length;
            return filledRequired === requiredFields;
        }).length;
        const completionRate = totalPatients > 0 ? Math.round((completedCount / totalPatients) * 100) : 0;


        // --- DYNAMIC FIELD ANALYSIS ---
        const fieldAnalysis = event.formFields.map((field: any) => {
            // Case A: Categorical
            if (['select', 'radio', 'checkbox', 'text'].includes(field.type)) {

                // Frequency Map
                const counts: Record<string, number> = {};
                let validResponses = 0;

                records.forEach((r: any) => {
                    const val = r.data?.[field.label];
                    if (val) {
                        counts[val] = (counts[val] || 0) + 1;
                        validResponses++;
                    }
                });

                // Convert to Array
                const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

                return {
                    id: field.label, // unique enough for this scope
                    label: field.label,
                    type: 'categorical',
                    totalResponses: validResponses,
                    data
                };
            }

            // Case B: Numerical
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
        }).filter(Boolean); // Remove nulls (e.g. text areas if we ignored them, or other types)


        return NextResponse.json({
            success: true,
            kpis: {
                totalPatients,
                completionRate,
                lastEntry: lastEntryTime
            },
            fields: fieldAnalysis
        });

    } catch {
        return NextResponse.json({ success: false, message: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
