'use server';

import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";
import { submissionRateLimit, getIP } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function subscribeToNewsletter(email: string, turnstileToken?: string) {
  try {
    if (!turnstileToken) {
      return { success: false, message: "Missing security token." };
    }

    const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
    if (!isValidTurnstile) {
      return { success: false, message: "Security check failed. Please try again." };
    }

    const ip = await getIP();
    const { success } = await submissionRateLimit.limit(ip);
    
    if (!success) {
      return { success: false, message: "Too many requests. Please try again later." };
    }

    const validated = newsletterSchema.safeParse({ email });
    if (!validated.success) {
      return { success: false, message: "Invalid email address." };
    }

    await dbConnect();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: validated.data.email });
    if (existing) {
      return { success: true, message: "You are already subscribed!" }; // Graceful early return
    }

    // Save strictly to the db
    await Subscriber.create({ email: validated.data.email });

    return { success: true, message: "Successfully subscribed to the newsletter!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "Internal server error. Please try again." };
  }
}
