'use server';

import dbConnect from "@/lib/db";
import SiteConfig from "@/models/SiteConfig";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

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
        const isActive = formData.get('isActive') === 'on';
        const maintenanceMode = formData.get('maintenanceMode') === 'on';
        const announcementBanner = formData.get('announcementBanner') as string;
        const whatsappNumber = formData.get('whatsappNumber') as string;

        // Social Media Links
        const socialMediaLinks = {
            email: {
                enabled: formData.get('social_email_enabled') === 'on',
                url: formData.get('social_email_url') as string || ''
            },
            twitter: {
                enabled: formData.get('social_twitter_enabled') === 'on',
                url: formData.get('social_twitter_url') as string || ''
            },
            linkedin: {
                enabled: formData.get('social_linkedin_enabled') === 'on',
                url: formData.get('social_linkedin_url') as string || ''
            },
            facebook: {
                enabled: formData.get('social_facebook_enabled') === 'on',
                url: formData.get('social_facebook_url') as string || ''
            }
        };

        let logoUrl = formData.get('logoUrl') as string;
        const logoFile = formData.get('logoFile') as File;

        if (logoFile && logoFile.size > 0 && logoFile.name !== 'undefined') {
            if (!logoFile.type.startsWith('image/')) {
                return { success: false, message: 'Invalid file type. Please upload an image.' };
            }
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const filename = `logo-${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            
            // Ensure uploads directory exists
            const uploadDir = join(cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            
            // Write file
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);
            
            // Update logoUrl to point to the new file
            logoUrl = `/uploads/${filename}`;
        }

        // Update the singleton
        await SiteConfig.findOneAndUpdate({}, {
            themeMode,
            primaryColor,
            secondaryColor,
            logoUrl,
            isActive,
            maintenanceMode,
            socialMediaLinks
        }, { upsert: true, new: true, setDefaultsOnInsert: true });

        revalidatePath('/');
        return { success: true, message: 'Site configuration updated successfully' };
    } catch (error) {
        console.error('Error updating site config:', error);
        return { success: false, message: 'Failed to update configuration' };
    }
}
