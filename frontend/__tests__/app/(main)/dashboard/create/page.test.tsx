import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import CreatePortfolioPage from "@/app/(main)/dashboard/create/page";

import { doesPortfolioExist } from "@/features/portfolio/services";

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

jest.mock("@/features/portfolio/services", () => ({
  doesPortfolioExist: jest.fn(),
}));

jest.mock("@/app/(main)/dashboard/create/CreatePortfolioClient", () => () => (
  <div data-testid="create-client-mock" />
));

const mockedCurrentUser = currentUser as jest.Mock;
const mockedDoesPortfolioExist = doesPortfolioExist as jest.Mock;

describe("CreatePortfolioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedCurrentUser.mockResolvedValue({ id: "user_123" });
  });

  test("redirects to /sign-in if user is not authenticated", async () => {
    mockedCurrentUser.mockResolvedValue(null);

    await expect(CreatePortfolioPage()).rejects.toThrow("NEXT_REDIRECT: /sign-in");

    expect(redirect).toHaveBeenCalledWith("/sign-in");
    expect(mockedDoesPortfolioExist).not.toHaveBeenCalled();
  });

  test("redirects to /dashboard if an existing portfolio is found", async () => {
    mockedDoesPortfolioExist.mockResolvedValueOnce(true);

    await expect(CreatePortfolioPage()).rejects.toThrow("NEXT_REDIRECT: /dashboard");

    expect(mockedDoesPortfolioExist).toHaveBeenCalledWith("user_123");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  test("renders CreatePortfolioClient if no existing portfolio is found", async () => {
    mockedDoesPortfolioExist.mockResolvedValueOnce(false);

    const Page = await CreatePortfolioPage();
    render(Page);

    expect(mockedDoesPortfolioExist).toHaveBeenCalledWith("user_123");
    expect(screen.getByTestId("create-client-mock")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
