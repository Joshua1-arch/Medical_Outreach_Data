import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import AdminNewsletterClient from "./AdminNewsletterClient";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default async function AdminNewsletterPage() {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
        redirect('/login');
    }

    await dbConnect();
    const subscribersResult = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
    const subscribers = subscribersResult.map((sub: any) => ({
        id: sub._id.toString(),
        email: sub.email,
        subscribedAt: sub.subscribedAt?.toISOString() || null
    }));
    const subscriberCount = subscribers.length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8 text-slate-500">
                    <Link href="/admin" className="hover:text-slate-900 transition-colors flex items-center gap-2">
                        <LayoutDashboard size={18} />
                        Back to Admin Dashboard
                    </Link>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">Newsletter Blast</h1>
                <p className="text-slate-600 mb-8">
                    Compose and send emails to all your subscribers. Current subscriber count:{' '}
                    <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                        {subscriberCount}
                    </span>
                </p>

                <AdminNewsletterClient totalSubscribers={subscriberCount} subscribers={subscribers} />
            </div>
        </div>
    );
}
