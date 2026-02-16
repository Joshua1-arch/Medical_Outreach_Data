import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MasterData from '@/models/MasterData';

export async function GET() {
    try {
        await dbConnect();
        
        const data = await MasterData.find({ isActive: true }).select('category options -_id');
        
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch master data' }, { status: 500 });
    }
}
