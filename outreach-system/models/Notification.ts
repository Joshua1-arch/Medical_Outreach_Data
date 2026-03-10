import mongoose, { Schema } from 'mongoose';

export interface INotification {
    _id: string;
    userId: string;         // The user who receives this notification
    type: 'event_approved' | 'event_rejected' | 'milestone' | 'message';
    title: string;
    message: string;
    eventId?: string;       // Related event (optional)
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: String, required: true, index: true },
        type: { type: String, required: true, enum: ['event_approved', 'event_rejected', 'milestone', 'message'] },
        title: { type: String, required: true },
        message: { type: String, required: true },
        eventId: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Notification ||
    mongoose.model<INotification>('Notification', NotificationSchema);
