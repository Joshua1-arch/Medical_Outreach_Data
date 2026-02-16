
export type BloodGroup = 'A' | 'B' | 'AB' | 'O';
export type RhFactor = 'Positive' | 'Negative';

export interface BloodType {
    group: BloodGroup;
    rh: RhFactor;
}

export const getCompatibleRecipients = (group: BloodGroup, rh: RhFactor): string[] => {
    const isRhPos = rh === 'Positive';


    if (group === 'O') {
        if (!isRhPos) return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']; // O-
        return ['O+', 'A+', 'B+', 'AB+']; 
    }

    if (group === 'A') {
        if (!isRhPos) return ['A-', 'A+', 'AB-', 'AB+']; 
        return ['A+', 'AB+']; 
    }

    if (group === 'B') {
        if (!isRhPos) return ['B-', 'B+', 'AB-', 'AB+']; // B-
        return ['B+', 'AB+']; // B+
    }

    if (group === 'AB') {
        if (!isRhPos) return ['AB-', 'AB+']; // AB-
        return ['AB+']; // AB+
    }

    return [];
};
