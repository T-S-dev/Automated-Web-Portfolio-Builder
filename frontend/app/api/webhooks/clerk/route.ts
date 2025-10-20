import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

export async function POST(req: NextRequest) {
  try {
    const evt: WebhookEvent = await verifyWebhook(req);

    const eventType = evt.type;

    await mongooseConnect();

    switch (eventType) {
      case "user.updated": {
        const { id, username } = evt.data;

        if (!username) {
          return NextResponse.json(
            { error: "Username is missing in webhook data for user.updated event" },
            { status: 400 },
          );
        }

        await Portfolio.updateOne({ clerkId: id }, { $set: { username: username } });

        break;
      }
      case "user.deleted": {
        const { id } = evt.data;

        if (!id) {
          return NextResponse.json(
            { error: "User ID is missing in webhook data for user.deleted event" },
            { status: 400 },
          );
        }

        await Portfolio.deleteOne({ clerkId: id });

        break;
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error verifying or processing webhook:", error);
    return NextResponse.json("Error verifying webhook", { status: 400 });
  }
}
