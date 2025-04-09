import { headers } from "next/headers";
import { Webhook } from "svix";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  await mongooseConnect();

  const eventType = evt.type;

  if (eventType === "user.updated") {
    const { id: userId, username } = evt.data;

    try {
      // Find the portfolio document from MongoDB
      const existingPortfolio = await Portfolio.findOne({ clerkId: userId });

      // Only update if portfolio exists and username has changed, avoid unnecessary updates
      if (existingPortfolio && existingPortfolio?.username !== username) {
        await Portfolio.updateOne({ clerkId: userId }, { username });
        return new Response("User updated", { status: 200 });
      }
    } catch (error) {
      return new Response("Error updating user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id: userId } = evt.data;

    try {
      // Find the portfolio document from MongoDB
      const existingPortfolio = await Portfolio.findOne({ clerkId: userId });

      // Only delete if portfolio exists
      if (existingPortfolio) {
        await Portfolio.deleteOne({ clerkId: userId });
        return new Response("User deleted", { status: 200 });
      }
    } catch (error) {
      return new Response("Error deleting user", { status: 500 });
    }
  }

  return new Response("Webhook received, but user does not have a portfolio", { status: 200 });
}
