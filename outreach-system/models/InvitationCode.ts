import { Schema, model, models } from 'mongoose';

const InvitationCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    generatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

InvitationCodeSchema.index({ code: 1, isUsed: 1 });

const InvitationCode = models.InvitationCode || model('InvitationCode', InvitationCodeSchema);

export default InvitationCode;
