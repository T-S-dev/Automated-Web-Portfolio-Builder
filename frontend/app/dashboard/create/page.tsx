import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import CreatePortfolioClient from "./CreatePortfolioClient";

import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

const CreatePortfolioPage = async () => {
  await mongooseConnect();
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  if (await Portfolio.exists({ username: user.username })) {
    redirect("/dashboard");
  }

  return <CreatePortfolioClient />;
};

export default CreatePortfolioPage;
