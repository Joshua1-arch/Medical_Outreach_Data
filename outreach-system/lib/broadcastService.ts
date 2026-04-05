import Pusher from 'pusher';
import * as Ably from 'ably';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

const ably = new Ably.Rest(process.env.ABLY_SERVER_API_KEY || '');

export async function triggerRealtimeEvent(channel: string, event: string, data: any) {
    try {
        await pusher.trigger(channel, event, data);
    } catch (error: any) {
        // Inspect error for quota/rate limits or timeout
        const status = error?.status || error?.statusCode;
        const isRateLimit = status === 429 || status === 413;
        const msg = error?.message?.toLowerCase() || '';
        const isQuotaExceeded = msg.includes('quota') || msg.includes('limit');
        const isTimeout = error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET';

        if (isRateLimit || isQuotaExceeded || isTimeout) {
            console.warn("Pusher limit reached, falling back to Ably...");
            try {
                const ablyChannel = ably.channels.get(channel);
                await ablyChannel.publish(event, data);
            } catch (ablyError) {
                console.error("Ably fallback also failed:", ablyError);
                throw ablyError;
            }
        } else {
            console.error("Pusher error (not ratelimit):", error);
            throw error;
        }
    }
}
