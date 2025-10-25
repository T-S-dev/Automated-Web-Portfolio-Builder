import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import EditPortfolioPage from "@/app/(main)/dashboard/edit/page";
import EditPortfolioClient from "@/app/(main)/dashboard/edit/EditPortfolioClient";
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

jest.mock("@/app/(main)/dashboard/edit/EditPortfolioClient", () =>
  jest.fn(() => <div data-testid="edit-client-mock" />),
);

const mockedCurrentUser = currentUser as jest.Mock;
const mockedGetPortfolio = getPortfolioByUsername as jest.Mock;
const mockedEditClient = EditPortfolioClient as jest.Mock;

describe("EditPortfolioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedCurrentUser.mockResolvedValue({ id: "user_123", username: "johndoe" });
  });

  test("redirects to /sign-in if user is not authenticated", async () => {
    mockedCurrentUser.mockResolvedValue(null);

    await expect(EditPortfolioPage()).rejects.toThrow("NEXT_REDIRECT: /sign-in");

    expect(redirect).toHaveBeenCalledWith("/sign-in");
    expect(mockedGetPortfolio).not.toHaveBeenCalled();
  });

  test("redirects to /dashboard/create if no portfolio is found", async () => {
    mockedGetPortfolio.mockResolvedValue(null);

    await expect(EditPortfolioPage()).rejects.toThrow("NEXT_REDIRECT: /dashboard/create");

    expect(mockedGetPortfolio).toHaveBeenCalledWith("johndoe");
    expect(redirect).toHaveBeenCalledWith("/dashboard/create");
  });

  test("renders EditPortfolioClient with transformed portfolio data (happy path)", async () => {
    // This is the FULL object returned from the service
    const mockFullPortfolioDoc = {
      clerkId: "user_123",
      username: "johndoe",
      is_private: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // These fields should be passed to the client
      personal: { name: "John Doe" },
      skills: ["React"],
      projects: [],
      experience: [],
    };

    // This is the TRANSFORMED object we expect to be passed as a prop
    const expectedClientPortfolio = {
      personal: { name: "John Doe" },
      skills: ["React"],
      projects: [],
      experience: [],
    };

    mockedGetPortfolio.mockResolvedValue(mockFullPortfolioDoc);

    const Page = await EditPortfolioPage();
    render(Page);

    expect(screen.getByTestId("edit-client-mock")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();

    // CRITICAL: Check that the client was called with the CORRECTLY TRANSFORMED props
    expect(mockedEditClient).toHaveBeenCalledWith({ portfolio: expectedClientPortfolio }, undefined);
  });
});
