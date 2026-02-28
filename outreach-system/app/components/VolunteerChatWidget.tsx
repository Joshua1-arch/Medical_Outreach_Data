"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { MessageCircle, X, Send } from "lucide-react";

type Message = {
  _id: string;
  text: string;
  senderName: string;
  role: "Admin" | "Volunteer";
  timestamp: string;
};

export default function VolunteerChatWidget({ eventId, volunteerName }: { eventId: string; volunteerName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0); // Clear badge on open
    }
  }, [messages, isOpen]);

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
         console.error("Failed to load Volunteer chat:", err);
      }
    };
    fetchHistory();

    // 2. Setup Pusher
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return; // Prevent crashes

    const pusher = new Pusher(pusherKey, { 
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth"
    });
    const channel = pusher.subscribe(`private-event-${eventId}`);

    channel.bind("message", (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
      setUnreadCount((prev) => (isOpen ? 0 : prev + 1));
    });

    return () => {
      pusher.unsubscribe(`private-event-${eventId}`);
      pusher.disconnect();
    };
  }, [eventId, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempText = newMessage;
    setNewMessage("");

    try {
      await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tempText, senderName: volunteerName, role: "Volunteer" }),
      });
    } catch (err) {
       console.error("Volunteer failed to send message", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Floating Widget Chat Window - Collapsible */}
      {isOpen && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-[320px] h-[450px] mb-4 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Live Chat
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-xs text-slate-400 my-4">No messages yet. Say hi to the Admin!</p>
            )}
            {messages.map((msg, idx) => {
              const isAdmin = msg.role === "Admin";
              // Volunteer UI flips the alignment: Volunteer messages (my messages) left or right?
              // Typically, mapping "My messages" -> Right side.
              // VolunteerName could match msg.senderName for logic, but let's just use Role.
              const isMe = msg.role === "Volunteer" && msg.senderName === volunteerName;

              return (
                <div key={msg._id || idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                    {msg.senderName} • {msg.role}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      isAdmin 
                        ? "bg-emerald-100 text-emerald-900 rounded-bl-sm" // Admin stands out
                        : isMe 
                          ? "bg-slate-900 text-white rounded-br-sm" // Me
                          : "bg-slate-200 text-slate-800 rounded-bl-sm" // Other volunteers
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Ask the Admin..."
              className="flex-1 bg-slate-100 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 shadow-xl text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform hover:shadow-2xl relative border-2 border-white"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        
        {/* Unread Badge Overlay */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white animate-bounce shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
