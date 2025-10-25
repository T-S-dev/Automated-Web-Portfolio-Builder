import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { getPortfolioByUsername } from "@/features/portfolio/services";
import { TemplateMappings, DefaultTemplate } from "@/features/template/lib/TemplateMappings";

import { tryCatch } from "@/shared/lib/tryCatch";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await currentUser();

  const [portfolioDoc, _] = await tryCatch(getPortfolioByUsername(username));
  if (!portfolioDoc) {
    return {
      title: "Portfolio Not Found",
    };
  }

  if (portfolioDoc.is_private && user?.username !== username) {
    return {
      title: "Portfolio Not Found",
    };
  }

  const ownerName = portfolioDoc.personal.name;
  // If name ends with "s" or "S", just append an apostrophe. Otherwise, add 's.
  const titleName = /s$/i.test(ownerName) ? `${ownerName}'` : `${ownerName}'s`;

  return {
    title: `${titleName} Portfolio | Automated Web Portfolio Builder`,
    description: `View ${titleName} online portfolio, generated automatically from their resume.`,
  };
}

const PortfolioPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;
  const user = await currentUser();

  const [portfolioDoc, _] = await tryCatch(getPortfolioByUsername(username));
  if (!portfolioDoc) return notFound();

  if (portfolioDoc.is_private && user?.username !== username) {
    return notFound();
  }

  const SelectedTemplate = TemplateMappings[portfolioDoc.template] || DefaultTemplate;

  const { clerkId, username: _username, is_private, createdAt, updatedAt, ...clientPortfolio } = portfolioDoc;

  return <SelectedTemplate portfolio={clientPortfolio} />;
};

export default PortfolioPage;
