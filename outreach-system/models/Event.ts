import { Schema, model, models } from 'mongoose';

const FormFieldSchema = new Schema({
    label: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'text', 'number', 'date', 'select'
    options: [String], // for select inputs if applicable
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
    reason: { type: String }, // Rationale for the event
    purpose: { type: String }, // Goal/Objective
    date: { type: Date, required: true },
    location: { type: String, required: true },
    coverImage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // The Form Builder Schema - defaults to empty until User designs it
    formFields: {
        type: [FormFieldSchema],
        default: []
    },
    // Inventory Management
    inventory: {
        type: [InventoryItemSchema],
        default: []
    },
    // Public Access Settings
    isPublic: { type: Boolean, default: false },
    accessCode: { type: String }, // Optional password for public access
}, { timestamps: true });

const Event = models.Event || model('Event', EventSchema);

export default Event;
