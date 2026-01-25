import mongoose, { Schema, model, models } from 'mongoose';

const RecordSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    data: { type: Schema.Types.Mixed, required: true }, // Stores the dynamic answers key-value pairs
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for public submissions
    retrievalCode: { type: String, unique: true, sparse: true }, // For retrieving/updating records
}, { timestamps: true });

const Record = models.Record || model('Record', RecordSchema);

export default Record;
