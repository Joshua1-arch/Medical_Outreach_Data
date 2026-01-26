
import { BloodGroup, RhFactor, getCompatibleRecipients } from "./blood-utils";

export const calculateRecipients = (group: string, rhesus: string): string[] => {
    // Adapter to match string inputs to the strict types if needed, or just use the logic directly.
    // The previous utility used 'Positive'/'Negative'. The prompt uses 'Positive'/'Negative'.
    // The prompt uses 'A', 'B', 'AB', 'O'.

    return getCompatibleRecipients(group as BloodGroup, rhesus as RhFactor);
};
