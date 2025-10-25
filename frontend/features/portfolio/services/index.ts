import "server-only";
import { NotFoundError } from "@/shared/lib/errors";
import { mongooseConnect } from "@/shared/lib/mongoose";
import PortfolioModel from "@/shared/models/Portfolio";

import { Portfolio, PortfolioDocument } from "@/types";
import { removeInternalFields } from "@/shared/lib/mongoRemoveInternalFields";

export async function createOrUpdatePortfolio(clerkId: string, username: string, data: Portfolio): Promise<void> {
  await mongooseConnect();

  await PortfolioModel.findOneAndUpdate(
    { clerkId },
    { ...data, clerkId, username },
    {
      new: true,
      upsert: true,
    },
  );
}

export async function getPortfolioByUsername(username: string): Promise<PortfolioDocument> {
  if (!username) {
    throw new NotFoundError("Username is required to fetch portfolio.");
  }

  await mongooseConnect();

  const portfolioDoc = await PortfolioModel.findOne({ username }).lean<PortfolioDocument>();

  if (!portfolioDoc) {
    throw new NotFoundError("Portfolio not found.");
  }

  const cleanDoc = removeInternalFields(portfolioDoc);

  return cleanDoc;
}

export async function doesPortfolioExist(clerkId: string): Promise<boolean> {
  if (!clerkId) {
    throw new NotFoundError("Clerk ID is required to check portfolio existence.");
  }

  await mongooseConnect();
  const portfolio = await PortfolioModel.exists({ clerkId });
  return portfolio !== null;
}

export async function deletePortfolio(clerkId: string): Promise<void> {
  if (!clerkId) {
    throw new NotFoundError("Clerk ID is required to delete portfolio.");
  }

  await mongooseConnect();
  const deletedPortfolio = await PortfolioModel.findOneAndDelete({ clerkId });

  if (!deletedPortfolio) {
    throw new NotFoundError("Portfolio not found to delete.");
  }
}

export async function updatePortfolioPrivacy(clerkId: string, is_private: boolean): Promise<PortfolioDocument> {
  if (!clerkId) {
    throw new NotFoundError("Clerk ID is required to update portfolio privacy.");
  }

  await mongooseConnect();
  const updatedPortfolio = await PortfolioModel.findOneAndUpdate(
    { clerkId },
    { $set: { is_private } },
    { new: true },
  ).lean<PortfolioDocument>();

  if (!updatedPortfolio) {
    throw new NotFoundError("Portfolio not found to update.");
  }

  return updatedPortfolio;
}
