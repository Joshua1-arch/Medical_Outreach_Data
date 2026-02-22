import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MasterData from '@/models/MasterData';

export async function GET() {
    try {
        await dbConnect();
        
        const data = await MasterData.find({ isActive: true }).select('category options -_id');
        
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
