import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditPortfolioPage from "@/app/dashboard/edit/page";
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

jest.mock("@/app/dashboard/edit/EditPortfolioClient", () => () => <div>Edit Portfolio Client Mock</div>);

describe("EditPortfolioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentUser.mockResolvedValue({ username: "john123" });
  });

  test("redirects to /dashboard/create if no portfolio exists", async () => {
    getPortfolio.mockResolvedValueOnce(null);

    await EditPortfolioPage();

    expect(redirect).toHaveBeenCalledWith("/dashboard/create");
  });

  test("renders EditPortfolioClient if portfolio exists", async () => {
    getPortfolio.mockResolvedValueOnce({ title: "My Portfolio" });

    render(await EditPortfolioPage());

    expect(screen.getByText("Edit Portfolio Client Mock")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
