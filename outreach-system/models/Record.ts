import { Schema, model, models } from 'mongoose';

const RecordSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    data: { type: Schema.Types.Mixed, required: true }, 
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    retrievalCode: { type: String, unique: true, sparse: true }, 
    patientHash: { type: String, index: true },
    patientPhone: { type: String, index: true },
    projectID: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
    resultEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

RecordSchema.index({ patientHash: 1, createdAt: -1 });
RecordSchema.index({ projectID: 1, createdAt: -1 });

const Record = models.Record || model('Record', RecordSchema);

export default Record;
