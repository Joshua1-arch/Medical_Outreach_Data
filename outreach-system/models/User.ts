import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending'
    },
    isTrusted: {
        type: Boolean,
        default: false
    },
    // Extended profile fields
    phone: { type: String, default: '' },
    medicalRole: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    exportFormat: { type: String, enum: ['csv', 'word'], default: 'csv' },
    deletionRequested: { type: Boolean, default: false },
    deletionRequestedAt: { type: Date },

    resetPasswordToken: { type: String, sparse: true },
    resetPasswordExpires: { type: Date, sparse: true },
}, { timestamps: true });


const User = models.User || model('User', UserSchema);

export default User;
