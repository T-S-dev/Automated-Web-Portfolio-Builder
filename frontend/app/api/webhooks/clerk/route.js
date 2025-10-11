import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

export async function POST(req) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    await mongooseConnect();

    switch (eventType) {
      case "user.updated": {
        const { id, username } = evt.data;

        if (!username) {
          return new Response({ error: "Username is missing in webhook data for user.updated event" }, { status: 400 });
        }

        await Portfolio.updateOne({ clerkId: id }, { $set: { username: username } });

        break;
      }
      case "user.deleted": {
        const { id } = evt.data;

        if (!id) {
          return new Response({ error: "User ID is missing in webhook data for user.deleted event" }, { status: 400 });
        }

        await Portfolio.deleteOne({ clerkId: id });

        break;
      }
    }

    return new Response({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error verifying or processing webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
