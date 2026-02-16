import { Schema, model, models, Document } from 'mongoose';
import { getCompatibleRecipients, BloodGroup, RhFactor } from '@/lib/blood-utils';

interface IDonation extends Document {
    isFitToDonate: boolean;
    donorVitals?: {
        weight: number;
        bloodPressure: string;
        pcv: number;
        age: number;
    };
    serology?: {
        hiv: boolean;
        hbsag: boolean;
        hcv: boolean;
        vdrl: boolean;
    };
    bloodGroup?: {
        group: string;
        rh: string;
    };
    compatibleRecipients: string[];
}

const DonationSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    donorName: { type: String, required: true }, // Basic identification
    donorVitals: {
        weight: { type: Number, required: true },
        bloodPressure: { type: String, required: true }, // e.g. "120/80"
        pcv: { type: Number, required: true },
        age: { type: Number, required: true }
    },
    serology: {
        hiv: { type: Boolean, required: true }, // True = Reactive (Bad)
        hbsag: { type: Boolean, required: true },
        hcv: { type: Boolean, required: true },
        vdrl: { type: Boolean, required: true }
    },
    bloodGroup: {
        group: { type: String, enum: ['A', 'B', 'AB', 'O'], required: function (this: IDonation) { return this.isFitToDonate; } },
        rh: { type: String, enum: ['Positive', 'Negative'], required: function (this: IDonation) { return this.isFitToDonate; } }
    },
    isFitToDonate: { type: Boolean, default: false },
    compatibleRecipients: { type: [String], default: [] }
}, { timestamps: true });

DonationSchema.pre('save', async function () {
    if (!this.donorVitals || !this.serology) {
        this.isFitToDonate = false;
        return;
    }

    const { weight, pcv } = this.donorVitals;
    const { hiv, hbsag, hcv, vdrl } = this.serology;

    const isVitalsGood = weight >= 50 && pcv >= 38;
    const isSerologyClean = !hiv && !hbsag && !hcv && !vdrl;

    this.isFitToDonate = isVitalsGood && isSerologyClean;

    if (this.isFitToDonate && this.bloodGroup && this.bloodGroup.group && this.bloodGroup.rh) {
        this.compatibleRecipients = getCompatibleRecipients(
            this.bloodGroup.group as BloodGroup,
            this.bloodGroup.rh as RhFactor
        );
    } else {
        this.compatibleRecipients = [];
    }
});

const Donation = models.Donation || model('Donation', DonationSchema);

export default Donation;
