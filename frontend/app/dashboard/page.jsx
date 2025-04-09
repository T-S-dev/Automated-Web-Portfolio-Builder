import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

import DashboardClient from "./DashboardClient";

import getPortfolio from "@/lib/getPortfolio";

const DashboardPage = async () => {
  const { username, firstName, lastName } = await currentUser();

  const portfolio = await getPortfolio(username);

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Welcome to your dashboard {firstName} {lastName}!
      </h1>

      {portfolio ? <DashboardClient portfolio={portfolio} /> : <CreatePortfolioSection />}
    </div>
  );
};

const CreatePortfolioSection = () => (
  <div className="flex flex-col items-center justify-center rounded-lg border p-6 shadow-md">
    <p className="mb-4 text-gray-600">You haven't created a portfolio yet.</p>
    <Link href="/dashboard/create">
      <button className="rounded-lg bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600">
        Create Portfolio
      </button>
    </Link>
  </div>
);

export default DashboardPage;
