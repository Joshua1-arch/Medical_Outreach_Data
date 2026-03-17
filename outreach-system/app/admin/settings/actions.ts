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

        async function handleImageField(fieldName: string): Promise<string | undefined> {
            let url = formData.get(`${fieldName}Url`) as string;
            const file = formData.get(`${fieldName}File`) as File;

            if (file && file.size > 0 && file.name !== 'undefined') {
                if (!file.type.startsWith('image/')) return url;
                const ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
                const allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
                if (!allowedExts.includes(ext)) return url;

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const baseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9-]/g, '') || 'upload';
                const filename = `${fieldName}-${Date.now()}-${baseName}.${ext}`;
                const uploadDir = join(cwd(), 'public', 'uploads');
                await mkdir(uploadDir, { recursive: true });
                const filepath = join(uploadDir, filename);
                await writeFile(filepath, buffer);
                url = `/uploads/${filename}`;
            }
            return url;
        }

        const logoUrl = await handleImageField('logo') || formData.get('logoUrl') as string;

        const images = {
            landingHero: await handleImageField('landingHero'),
            dataManagement: await handleImageField('dataManagement'),
            reporting: await handleImageField('reporting'),
            loginBg: await handleImageField('loginBg'),
            signupBg: await handleImageField('signupBg'),
            caseStudy1: await handleImageField('caseStudy1'),
            caseStudy2: await handleImageField('caseStudy2'),
            caseStudy3: await handleImageField('caseStudy3'),
            ctaBg: await handleImageField('ctaBg'),
        };

        // Update the singleton
        await SiteConfig.findOneAndUpdate({}, {
            themeMode,
            primaryColor,
            secondaryColor,
            logoUrl,
            isActive,
            maintenanceMode,
            socialMediaLinks,
            images
        }, { upsert: true, new: true, setDefaultsOnInsert: true });

        revalidatePath('/');
        return { success: true, message: 'Site configuration updated successfully' };
    } catch (error) {
        console.error('Error updating site config:', error);
        return { success: false, message: 'Failed to update configuration' };
    }
}
