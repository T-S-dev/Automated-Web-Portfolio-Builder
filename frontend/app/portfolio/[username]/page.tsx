import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import getPortfolio from "@/lib/getPortfolio";
import { TemplateMappings, DefaultTemplate } from "@/lib/TemplateMappings";

import { Portfolio } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const portfolio = await getPortfolio(username);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
    };
  }

  const ownerName = portfolio.personal.name;
  // If name ends with "s" or "S", just append an apostrophe. Otherwise, add 's.
  const titleName = /s$/i.test(ownerName) ? `${ownerName}' Portfolio` : `${ownerName}'s Portfolio`;

  return {
    title: `${titleName} | Automated Web Portfolio Builder`,
    description: `View ${ownerName}'s online portfolio, generated automatically from their resume.`,
  };
}

const PortfolioPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;
  const portfolio = await getPortfolio(username);

  const user = await currentUser();

  if (!portfolio) {
    return notFound();
  }

  if (portfolio.is_private && user?.username !== username) {
    return notFound();
  }

  const SelectedTemplate = TemplateMappings[portfolio.template] || DefaultTemplate;

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

  return <SelectedTemplate portfolio={clientPortfolio} />;
};

export default PortfolioPage;
