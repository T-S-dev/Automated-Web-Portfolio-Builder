import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreatePortfolioPage from "@/app/dashboard/create/page";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("@/lib/mongoose", () => ({
  mongooseConnect: jest.fn(),
}));

jest.mock("@/models/Portfolio", () => ({
  exists: jest.fn(),
}));

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
    Portfolio.exists.mockResolvedValueOnce(true);

    await CreatePortfolioPage();

    expect(mongooseConnect).toHaveBeenCalled();
    expect(Portfolio.exists).toHaveBeenCalledWith({ username: "john123" });
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  test("renders CreatePortfolioClient if no existing portfolio is found", async () => {
    Portfolio.exists.mockResolvedValueOnce(false);

    render(await CreatePortfolioPage());

    expect(screen.getByText("Create Portfolio Client Mock")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
