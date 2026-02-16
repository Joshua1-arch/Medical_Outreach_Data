'use server';

import dbConnect from "@/lib/db";
import SiteConfig from "@/models/SiteConfig";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getSiteConfig() {
    try {
        await dbConnect();
        // Singleton: Check if exists, if not create default
        let config = await SiteConfig.findOne();
        if (!config) {
            config = await SiteConfig.create({
                themeMode: 'default',
                primaryColor: '#0f172a',
                secondaryColor: '#fbbf24',
                logoUrl: '/Reach.png',
                announcementBanner: '',
                whatsappNumber: '+2349126461386',
                isActive: true
            });
        }
        return JSON.parse(JSON.stringify(config));
    } catch (error) {
        console.error('Error fetching site config:', error);
        return null;
    }
}

export async function updateSiteConfig(formData: FormData) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        await dbConnect();

        const themeMode = formData.get('themeMode');
        const primaryColor = formData.get('primaryColor');
        const secondaryColor = formData.get('secondaryColor');
        const logoUrl = formData.get('logoUrl');
        const announcementBanner = formData.get('announcementBanner');
        const whatsappNumber = formData.get('whatsappNumber');
        const isActive = formData.get('isActive') === 'on';
        const maintenanceMode = formData.get('maintenanceMode') === 'on';

        // Update the singleton
        await SiteConfig.findOneAndUpdate({}, {
            themeMode,
            primaryColor,
            secondaryColor,
            logoUrl,
            announcementBanner,
            whatsappNumber,
            isActive,
            maintenanceMode
        }, { upsert: true, new: true });

        revalidatePath('/');
        return { success: true, message: 'Site configuration updated successfully' };
    } catch (error) {
        console.error('Error updating site config:', error);
        return { success: false, message: 'Failed to update configuration' };
    }
}
