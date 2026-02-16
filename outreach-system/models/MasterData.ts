
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMasterData extends Document {
    category: string; // e.g. 'drugs', 'locations', 'diagnosis', 'lgas'
    options: string[];
    isActive: boolean;
}

const MasterDataSchema: Schema<IMasterData> = new Schema({
    category: {
        type: String,
        required: true,
        unique: true, // One document per category
        trim: true
    },
    options: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const MasterData: Model<IMasterData> = mongoose.models.MasterData || mongoose.model<IMasterData>('MasterData', MasterDataSchema);

export default MasterData;
