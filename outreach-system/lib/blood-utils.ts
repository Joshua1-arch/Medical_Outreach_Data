
export type BloodGroup = 'A' | 'B' | 'AB' | 'O';
export type RhFactor = 'Positive' | 'Negative';

export interface BloodType {
    group: BloodGroup;
    rh: RhFactor;
}

export const getCompatibleRecipients = (group: BloodGroup, rh: RhFactor): string[] => {
    const isRhPos = rh === 'Positive';

    // Logic based on standard compatibility rules
    // O- : Universal Donor -> All
    // O+ : O+, A+, B+, AB+
    // A- : A-, A+, AB-, AB+
    // A+ : A+, AB+
    // B- : B-, B+, AB-, AB+
    // B+ : B+, AB+
    // AB- : AB-, AB+
    // AB+ : AB+ (Universal Recipient)

    if (group === 'O') {
        if (!isRhPos) return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']; // O-
        return ['O+', 'A+', 'B+', 'AB+']; // O+
    }

    if (group === 'A') {
        if (!isRhPos) return ['A-', 'A+', 'AB-', 'AB+']; // A-
        return ['A+', 'AB+']; // A+
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
