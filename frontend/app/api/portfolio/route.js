import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { mongooseConnect } from "@/lib/mongoose";
import { PortfolioSchema } from "@/lib/Zod/portfolioSchema";
import Portfolio from "@/models/Portfolio";

export async function POST(req) {
  try {
    await mongooseConnect();
    // Get the current user from the request
    const { id: userId, username } = await currentUser(req);

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const portfolio = { username: username, clerkId: userId, ...body };

    // Validate the portfolio data using Zod schema
    const validation = PortfolioSchema.safeParse(portfolio);

    // If validation fails, return an error response
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid portfolio data", details: validation.error }, { status: 400 });
    }

    // Check if a portfolio already exists for the user
    const existingPortfolio = await Portfolio.findOne({ clerkId: userId });
    if (existingPortfolio) {
      return NextResponse.json({ error: "A portfolio already exists for this user." }, { status: 400 });
    }

    // Create a new portfolio if it doesn't exist
    await Portfolio.create({ username, clerkId: userId, ...validation.data });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error saving portfolio", details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await mongooseConnect();
    const { id: userId } = await currentUser(req);

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // Update portfolio privacy
    if (body.hasOwnProperty("is_private") && typeof body.is_private === "boolean") {
      const updatedPortfolio = await Portfolio.findOneAndUpdate(
        { clerkId: userId },
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
      { clerkId: userId },
      { $set: validation.data },
      { new: true },
    );

    if (!updatedPortfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error updating portfolio", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await mongooseConnect();
    const { id: userId } = await currentUser(req);

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const deletedPortfolio = await Portfolio.findOneAndDelete({ clerkId: userId });

    if (!deletedPortfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Portfolio deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting portfolio", details: error.message }, { status: 500 });
  }
}
