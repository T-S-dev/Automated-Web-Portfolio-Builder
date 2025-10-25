import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import CreatePortfolioPrompt from "@/features/dashboard/components/CreatePortfolioPrompt";
import DashboardClient from "@/features/dashboard/components/DashboardClient";
import { getPortfolioByUsername } from "@/features/portfolio/services";

import { DashboardPortfolio } from "@/types";
import { tryCatch } from "@/shared/lib/tryCatch";

const DashboardPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { username, firstName, lastName } = user;
  if (!username) {
    return (
      <div className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold">Welcome to your dashboard {user.firstName}!</h1>
        <p className="mb-4">Please set a username in your profile before creating a portfolio.</p>
      </div>
    );
  }

  let clientPortfolio: DashboardPortfolio | null = null;
  
  const [portfolio, _] = await tryCatch(getPortfolioByUsername(username));
  if (portfolio) {
    clientPortfolio = {
      personal: {
        name: portfolio.personal.name,
      },
      is_private: portfolio.is_private,
      username: portfolio.username,
    };
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Welcome to your dashboard {firstName} {lastName}!
      </h1>

      {clientPortfolio ? <DashboardClient portfolio={clientPortfolio} /> : <CreatePortfolioPrompt />}
    </div>
  );
};

export default DashboardPage;
