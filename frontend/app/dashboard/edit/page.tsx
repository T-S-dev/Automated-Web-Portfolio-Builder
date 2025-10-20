import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import getPortfolio from "@/lib/getPortfolio";

import EditPortfolioClient from "./EditPortfolioClient";

import { Portfolio } from "@/types";

const EditPortfolioPage = async () => {
  const user = await currentUser();

  if (!user?.username) {
    redirect("/sign-in");
  }

  const portfolio = await getPortfolio(user.username);

  if (!portfolio) {
    redirect("/dashboard/create");
  }

  const clientPortfolio: Portfolio = {
    template: portfolio.template,
    personal: portfolio.personal,
    professional_summary: portfolio.professional_summary,
    education: portfolio.education,
    experience: portfolio.experience,
    skills: portfolio.skills,
    projects: portfolio.projects,
    certifications: portfolio.certifications,
  };

  return <EditPortfolioClient portfolio={clientPortfolio} />;
};

export default EditPortfolioPage;
