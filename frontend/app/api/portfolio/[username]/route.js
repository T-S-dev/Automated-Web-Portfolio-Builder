import { NextResponse } from "next/server";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

export async function GET(req, context) {
  try {
    await mongooseConnect();
    const { username } = await context.params;

    const portfolio = await Portfolio.findOne({ username })
      .select("-clerkId -createdAt -updatedAt -__v -_id")
      .lean();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    ["education", "experience", "projects", "certifications"].forEach(
      (field) => {
        if (portfolio[field]) {
          portfolio[field] = portfolio[field].map(({ _id, ...rest }) => rest);
        }
      },
    );

    return NextResponse.json(portfolio, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
