import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import getPortfolio from "@/lib/getPortfolio";

import DashboardClient from "./DashboardClient";

import { DashboardPortfolio } from "@/types";

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

  const portfolio = await getPortfolio(username);

  let clientPortfolio: DashboardPortfolio | null = null;
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

      {clientPortfolio ? <DashboardClient portfolio={clientPortfolio} /> : <CreatePortfolioSection />}
    </div>
  );
};

const CreatePortfolioSection = () => (
  <div className="flex flex-col items-center justify-center rounded-lg border p-6 shadow-md">
    <p className="mb-4 text-gray-600">You haven&apos;t created a portfolio yet.</p>
    <Link href="/dashboard/create">
      <button className="rounded-lg bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600">
        Create Portfolio
      </button>
    </Link>
  </div>
);

export default DashboardPage;
