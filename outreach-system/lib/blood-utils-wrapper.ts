
import { BloodGroup, RhFactor, getCompatibleRecipients } from "./blood-utils";

export const calculateRecipients = (group: string, rhesus: string): string[] => {


    return getCompatibleRecipients(group as BloodGroup, rhesus as RhFactor);
};
