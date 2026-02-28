"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { Send } from "lucide-react";

type Message = {
  _id: string;
  text: string;
  senderName: string;
  role: "Admin" | "Volunteer";
  timestamp: string;
};

export default function AdminEventChat({ eventId, adminName }: { eventId: string; adminName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 1. Fetch history
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/chat`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();

    // 2. Subscribe to Pusher channel
    Pusher.logToConsole = false; // Set to true for debugging
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth"
    });

    const channel = pusher.subscribe(`private-event-${eventId}`);
    channel.bind("message", (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      pusher.unsubscribe(`private-event-${eventId}`);
      pusher.disconnect();
    };
  }, [eventId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempText = newMessage;
    setNewMessage("");

    try {
      await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tempText, senderName: adminName, role: "Admin" }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col h-[400px] mt-8 w-full">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-xl shrink-0">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Event Live Chat
        </h3>
        <p className="text-xs text-slate-500">Live feed bridging Admin and Volunteers</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isAdmin = msg.role === "Admin";
          return (
            <div key={msg._id || idx} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                {msg.senderName} • {msg.role}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  isAdmin
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-slate-200 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 rounded-b-xl shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-slate-100 border-none outline-none focus:ring-2 focus:ring-slate-400 rounded-lg text-sm transition-shadow"
            placeholder="Type a broadcast or reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
