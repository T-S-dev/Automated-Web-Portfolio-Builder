import { mongooseConnect } from "@/lib/mongoose";
import PortfolioModel from "@/models/Portfolio";

import { Portfolio, PortfolioDocument } from "@/types";

type MongooseSubDocument = {
  _id?: any;
};

const getPortfolio = async (username: string): Promise<PortfolioDocument | null> => {
  await mongooseConnect();

  const portfolio = await PortfolioModel.findOne({ username }).select("-__v").lean<PortfolioDocument>();

  if (!portfolio) {
    return null;
  }

  const fieldsToClean: (keyof Portfolio)[] = ["education", "experience", "projects", "certifications"];

  fieldsToClean.forEach((field) => {
    const value = portfolio[field];
    if (Array.isArray(value)) {
      (portfolio as any)[field] = value.map((item: (typeof value)[number] & MongooseSubDocument) => {
        const { _id, ...rest } = item;
        return rest;
      });
    }
  });

  if (portfolio.personal && (portfolio.personal as any)._id) {
    delete (portfolio.personal as any)._id;
  }

  if (portfolio.skills && (portfolio.skills as any)._id) {
    delete (portfolio.skills as any)._id;
  }

  return portfolio;
};

export default getPortfolio;
