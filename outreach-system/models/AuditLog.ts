import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    targetResource?: string; // e.g., "User: 12345" or "Event: 67890"
    details?: Record<string, unknown>; // JSON object with changes or snapshot
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    action: {
        type: String,
        required: true,
        uppercase: true,
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetResource: {
        type: String,
        required: false,
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true, // This adds createdAt and updatedAt
});

// Prevent model recompilation error in development
const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
