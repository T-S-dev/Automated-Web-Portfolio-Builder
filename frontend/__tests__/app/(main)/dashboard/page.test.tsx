import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import DashboardPage from "@/app/(main)/dashboard/page";
import DashboardClient from "@/features/dashboard/components/DashboardClient";

import { getPortfolioByUsername } from "@/features/portfolio/services";

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

jest.mock("@/features/portfolio/services", () => ({
  getPortfolioByUsername: jest.fn(),
}));

jest.mock("@/features/dashboard/components/DashboardClient", () =>
  jest.fn(() => <div data-testid="dashboard-client-mock" />),
);

jest.mock("@/features/dashboard/components/CreatePortfolioPrompt", () => () => (
  <div data-testid="create-prompt-mock" />
));

const mockedCurrentUser = currentUser as jest.Mock;
const mockedGetPortfolio = getPortfolioByUsername as jest.Mock;
const mockedDashboardClient = DashboardClient as jest.Mock;

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedCurrentUser.mockResolvedValue({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
    });
  });

  test("redirects to /sign-in if user is not authenticated", async () => {
    mockedCurrentUser.mockResolvedValue(null);

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT: /sign-in");

    expect(redirect).toHaveBeenCalledWith("/sign-in");
    expect(mockedGetPortfolio).not.toHaveBeenCalled();
  });

  test("shows 'set username' message if user has no username", async () => {
    mockedCurrentUser.mockResolvedValue({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      username: null,
    });

    const Page = await DashboardPage();
    render(Page);

    expect(screen.getByText("Please set a username in your profile before creating a portfolio.")).toBeInTheDocument();
    expect(mockedGetPortfolio).not.toHaveBeenCalled();
  });

  test("renders CreatePortfolioPrompt if no portfolio exists", async () => {
    mockedGetPortfolio.mockResolvedValue(null);

    const Page = await DashboardPage();
    render(Page);

    expect(screen.getByText("Welcome to your dashboard John Doe!")).toBeInTheDocument();
    expect(screen.getByTestId("create-prompt-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-client-mock")).not.toBeInTheDocument();
  });

  test("renders DashboardClient if portfolio exists", async () => {
    const mockFullPortfolio = {
      personal: { name: "John Doe", email: "test@test.com", phone: "123" },
      is_private: false,
      username: "johndoe",
      skills: ["React"],
    };

    const expectedClientPortfolio = {
      personal: { name: "John Doe" },
      is_private: false,
      username: "johndoe",
    };

    mockedGetPortfolio.mockResolvedValue(mockFullPortfolio);

    const Page = await DashboardPage();
    render(Page);

    expect(screen.getByText("Welcome to your dashboard John Doe!")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-client-mock")).toBeInTheDocument();
    expect(mockedDashboardClient).toHaveBeenCalledWith({ portfolio: expectedClientPortfolio }, undefined);

    expect(screen.queryByTestId("create-prompt-mock")).not.toBeInTheDocument();
  });

  test("renders CreatePortfolioPrompt if fetching portfolio throws an error", async () => {
    mockedGetPortfolio.mockRejectedValue(new Error("Database connection failed"));

    const Page = await DashboardPage();
    render(Page);

    // It should "fail gracefully" by showing the create prompt
    expect(screen.getByText("Welcome to your dashboard John Doe!")).toBeInTheDocument();
    expect(screen.getByTestId("create-prompt-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-client-mock")).not.toBeInTheDocument();
  });
});
