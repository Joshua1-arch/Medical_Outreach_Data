import { create } from 'zustand';

interface EventData {
    _id: string;
    title: string;
    status: string;
    [key: string]: any;
}

interface RecordData {
    _id: string;
    eventId: string;
    [key: string]: any;
}

interface MessageData {
    _id: string;
    eventId: string;
    [key: string]: any;
}

interface DashboardState {
    events: EventData[];
    responses: RecordData[];
    analytics: any[];
    forms: any[];
    chatHistory: MessageData[];
    isHydrated: boolean;
    updateStore: (data: {
        events: EventData[];
        responses: RecordData[];
        analytics?: any[];
        forms?: any[];
        chatHistory: MessageData[];
    }) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    events: [],
    responses: [],
    analytics: [],
    forms: [],
    chatHistory: [],
    isHydrated: false,
    updateStore: (data) =>
        set((state) => ({
            ...state,
            ...data,
            isHydrated: true,
        })),
}));
