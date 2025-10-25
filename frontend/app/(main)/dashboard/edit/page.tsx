import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { getPortfolioByUsername } from "@/features/portfolio/services";

import EditPortfolioClient from "./EditPortfolioClient";

import { tryCatch } from "@/shared/lib/tryCatch";

const EditPortfolioPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [portfolioDoc, _] = await tryCatch(getPortfolioByUsername(user.username || ""));
  if (!portfolioDoc) redirect("/dashboard/create");

  const { clerkId, username, is_private, createdAt, updatedAt, ...clientPortfolio } = portfolioDoc;

  return <EditPortfolioClient portfolio={clientPortfolio} />;
};

export default EditPortfolioPage;
