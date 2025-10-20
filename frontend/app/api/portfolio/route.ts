import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { mongooseConnect } from "@/lib/mongoose";
import { PortfolioSchema } from "@/lib/Zod/portfolioSchema";
import Portfolio from "@/models/Portfolio";

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    // Get the current user from the request
    const user = await currentUser();

    if (!user?.id || !user?.username) {
      return NextResponse.json({ error: "User not authenticated or username is missing" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the portfolio data using Zod schema
    const validation = PortfolioSchema.safeParse(body);

    // If validation fails, return an error response
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid portfolio data", details: validation.error }, { status: 400 });
    }

    if (await Portfolio.exists({ clerkId: user.id })) {
      return NextResponse.json({ error: "A portfolio already exists for this user." }, { status: 400 });
    }

    // Create a new portfolio if it doesn't exist
    await Portfolio.create({ username: user.username, clerkId: user.id, ...validation.data });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/portfolio Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Error saving portfolio", details: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // Update portfolio privacy
    if (body.hasOwnProperty("is_private") && typeof body.is_private === "boolean") {
      const updatedPortfolio = await Portfolio.findOneAndUpdate(
        { clerkId: user.id },
        { $set: { is_private: body.is_private } },
        { new: true },
      );

      if (!updatedPortfolio) {
        return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Update portfolio data
    const validation = PortfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { clerkId: user.id },
      { $set: validation.data },
      { new: true },
    );

    if (!updatedPortfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/portfolio Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Error updating portfolio", details: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const deletedPortfolio = await Portfolio.findOneAndDelete({ clerkId: user.id });

    if (!deletedPortfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Portfolio deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/portfolio Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: "Error deleting portfolio", details: message }, { status: 500 });
  }
}
