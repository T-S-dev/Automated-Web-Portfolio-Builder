import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import EditPortfolioClient from "./EditPortfolioClient";

import getPortfolio from "@/lib/getPortfolio";

const EditPortfolioPage = async () => {
  const { username } = await currentUser();

  const portfolio = await getPortfolio(username);

  if (!portfolio) {
    redirect("/dashboard/create");
  }

  return <EditPortfolioClient portfolio={portfolio} />;
};

export default EditPortfolioPage;
