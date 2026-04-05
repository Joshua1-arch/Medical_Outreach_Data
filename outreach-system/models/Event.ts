import { Schema, model, models } from 'mongoose';

const FormFieldSchema = new Schema({
    label: { type: String, required: true },
    type: { type: String, required: true },
    options: [String],
    required: { type: Boolean, default: false },
    width: { type: String, enum: ['full', 'half'], default: 'full' }
}, { _id: false });

const InventoryItemSchema = new Schema({
    itemName: { type: String, required: true },
    startingStock: { type: Number, required: true }
}, { _id: false });

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    reason: { type: String },
    purpose: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    coverImage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    formFields: {
        type: [FormFieldSchema],
        default: []
    },
    inventory: {
        type: [InventoryItemSchema],
        default: []
    },
    isPublic: { type: Boolean, default: false },
    accessCode: { type: String },
    code: { type: String, unique: true, index: true },
    maxConcurrentUsers: { type: Number, default: 0 },
}, {
    timestamps: true,
    strict: true, // OWASP: reject any fields not defined in this schema
});

// Performance indexes for dashboard queries
EventSchema.index({ createdBy: 1, status: 1 });      // countDocuments({ createdBy, status })
EventSchema.index({ createdBy: 1, createdAt: -1 });   // recent events sorted by date
EventSchema.index({ status: 1, date: -1 });           // admin event listing

const Event = models.Event || model('Event', EventSchema);

export default Event;
