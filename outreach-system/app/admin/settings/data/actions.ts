'use server';

import dbConnect from "@/lib/db";
import MasterData from "@/models/MasterData";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Fetch all lists or a specific category
export async function getMasterData(category?: string) {
    try {
        await dbConnect();
        
        // Auto-initialize categories if they don't exist
        const defaultCategories = ['drugs', 'diagnosis', 'locations'];
        for (const cat of defaultCategories) {
            await ensureCategory(cat);
        }

        if (category) {
            const data = await MasterData.findOne({ category });
            return data ? JSON.parse(JSON.stringify(data)) : null;
        }

        const allData = await MasterData.find({});
        return JSON.parse(JSON.stringify(allData));
    } catch (error) {
        console.error('Error fetching master data:', error);
        return [];
    }
}

// Ensure a category exists (initialize if missing)
export async function ensureCategory(category: string) {
    try {
        await dbConnect();
        const existing = await MasterData.findOne({ category });
        if (!existing) {
            await MasterData.create({ category, options: [] });
            return { success: true, message: `Created category: ${category}` };
        }
        return { success: true, message: 'Category exists' };
    } catch {
        return { success: false, message: 'Failed to ensure category' };
    }
}

// Add an option to a list
export async function addOption(category: string, option: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') return { success: false, message: 'Unauthorized' };

        await dbConnect();
        const doc = await MasterData.findOne({ category });
        
        if (!doc) {
            // Auto-create if not exists? Or strict error? Let's auto-create.
            await MasterData.create({ category, options: [option] });
        } else {
            if (doc.options.includes(option)) {
                return { success: false, message: 'Option already exists' };
            }
            doc.options.push(option);
            await doc.save();
        }

        revalidatePath('/admin/settings/data');
        return { success: true, message: 'Option added' };
    } catch (error) {
        return { success: false, message: 'Failed to add option' };
    }
}

// Remove an option
export async function removeOption(category: string, option: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') return { success: false, message: 'Unauthorized' };

        await dbConnect();
        await MasterData.updateOne(
            { category },
            { $pull: { options: option } }
        );

        revalidatePath('/admin/settings/data');
        return { success: true, message: 'Option removed' };
    } catch (error) {
        return { success: false, message: 'Failed to remove option' };
    }
}
