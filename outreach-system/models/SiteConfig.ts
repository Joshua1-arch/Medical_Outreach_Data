
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteConfig extends Document {
    themeMode: 'default' | 'christmas' | 'easter';
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    announcementBanner: string;
    whatsappNumber: string;
    isActive: boolean;
    maintenanceMode: boolean;
    socialMediaLinks?: {
        email?: { enabled: boolean; url: string };
        twitter?: { enabled: boolean; url: string };
        linkedin?: { enabled: boolean; url: string };
        facebook?: { enabled: boolean; url: string };
    };
}

const SiteConfigSchema: Schema<ISiteConfig> = new Schema({
    themeMode: {
        type: String,
        enum: ['default', 'christmas', 'easter', 'newyear', 'halloween', 'valentine'],
        default: 'default'
    },
    socialMediaLinks: {
        email: { enabled: Boolean, url: String },
        twitter: { enabled: Boolean, url: String },
        linkedin: { enabled: Boolean, url: String },
        facebook: { enabled: Boolean, url: String }
    },
    primaryColor: {
        type: String,
        default: '#0f172a' 
    },
    secondaryColor: {
        type: String,
        default: '#fbbf24' 
    },
    logoUrl: {
        type: String,
        default: '/Reach.png'
    },
    announcementBanner: {
        type: String,
        default: ''
    },
    whatsappNumber: {
        type: String,
        default: '+2349126461386'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

SiteConfigSchema.statics.getSingleton = async function () {
    const config = await this.findOne();
    if (config) return config;
    return await this.create({});
};

const SiteConfig: Model<ISiteConfig> = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export default SiteConfig;
