import mongoose, { Schema, model, models } from 'mongoose';

const RecordSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    data: { type: Schema.Types.Mixed, required: true }, // Stores the dynamic answers key-value pairs
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for public submissions
    retrievalCode: { type: String, unique: true, sparse: true }, // For retrieving/updating records
    patientHash: { type: String, index: true }, // Hash of Name + Phone + Gender for patient tracking
    resultEmailSent: { type: Boolean, default: false }, // Track if result email has been sent
}, { timestamps: true });

// Index for efficient patient history lookups
RecordSchema.index({ patientHash: 1, createdAt: -1 });

const Record = models.Record || model('Record', RecordSchema);

export default Record;
