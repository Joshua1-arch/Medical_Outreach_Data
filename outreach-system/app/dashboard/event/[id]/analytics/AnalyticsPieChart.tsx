
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsPieChartProps {
    data: any[];
}

export default function AnalyticsPieChart({ data }: AnalyticsPieChartProps) {
    // Color Logic
    const getColor = (name: string, index: number) => {
        const n = name.toLowerCase();
        if (n.includes('positive') || n.includes('reactive')) return '#ef4444'; // Red
        if (n.includes('negative') || n.includes('non-reactive')) return '#22c55e'; // Green

        const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];
        return COLORS[index % COLORS.length];
    };

    return (
        <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
