import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, select: false }, // OWASP: never returned by default
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
    isPremium: { type: Boolean, default: false },

    resetPasswordToken: { type: String, sparse: true, select: false },   // OWASP: never returned by default
    resetPasswordExpires: { type: Date, sparse: true, select: false },   // OWASP: never returned by default
}, {
    timestamps: true,
    strict: true, // OWASP: reject any fields not defined in this schema
});


const User = models.User || model('User', UserSchema);

export default User;

