import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage extends Document {
  eventId: mongoose.Types.ObjectId | string;
  senderName: string;
  role: "Admin" | "Volunteer";
  text: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    senderName: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Volunteer"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
