import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import CreatePortfolioClient from "./CreatePortfolioClient";

import { tryCatch } from "@/shared/lib/tryCatch";
import { doesPortfolioExist } from "@/features/portfolio/services";

const CreatePortfolioPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [portfolioExists, _] = await tryCatch(doesPortfolioExist(user.id));

  if (portfolioExists) redirect("/dashboard");

  return <CreatePortfolioClient />;
};

export default CreatePortfolioPage;
