import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreatePortfolioPage from "@/app/dashboard/create/page";
import { currentUser } from "@clerk/nextjs/server";
import getPortfolio from "@/lib/getPortfolio";
import { redirect } from "next/navigation";

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("@/lib/getPortfolio");

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/dashboard/create/CreatePortfolioClient", () => () => <div>Create Portfolio Client Mock</div>);

describe("CreatePortfolioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentUser.mockResolvedValue({ username: "john123" });
  });

  test("redirects to /dashboard if an existing portfolio is found", async () => {
    getPortfolio.mockResolvedValueOnce({ title: "My Portfolio" });

    await act(async () => {
      await CreatePortfolioPage();
    });

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  test("renders CreatePortfolioClient if no existing portfolio is found", async () => {
    getPortfolio.mockResolvedValueOnce(null);

    let pageComponent;
    await act(async () => {
      pageComponent = await CreatePortfolioPage();
    });

    render(pageComponent);

    expect(screen.getByText("Create Portfolio Client Mock")).toBeInTheDocument();

    expect(redirect).not.toHaveBeenCalled();
  });
});
