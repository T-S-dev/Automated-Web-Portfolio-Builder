import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import CreatePortfolioClient from "./CreatePortfolioClient";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

const CreatePortfolioPage = async () => {
  await mongooseConnect();
  const { username } = await currentUser();

  if (await Portfolio.exists({ username })) {
    redirect("/dashboard");
  }

  return <CreatePortfolioClient />;
};

export default CreatePortfolioPage;
