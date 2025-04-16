import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PortfolioPage from "@/app/portfolio/[username]/page";
import getPortfolio from "@/lib/getPortfolio";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

jest.mock("@/lib/getPortfolio");

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/lib/TemplateMappings", () => ({
  TemplateMappings: {
    1: ({ portfolio }) => <div>Template 1 - {portfolio.personal.name}</div>,
    2: ({ portfolio }) => <div>Template 2 - {portfolio.personal.name}</div>,
  },
  DefaultTemplate: ({ portfolio }) => <div>Default Template - {portfolio.personal.name}</div>,
}));

describe("PortfolioPage", () => {
  const mockParams = { username: "john123" };
  const mockPortfolio = {
    template: 1,
    is_private: false,
    personal: { name: "John Doe" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls notFound if no portfolio is found", async () => {
    getPortfolio.mockResolvedValueOnce(null);
    currentUser.mockResolvedValueOnce(null);

    await PortfolioPage({ params: mockParams });

    expect(notFound).toHaveBeenCalled();
  });

  test("calls notFound if portfolio is private and user is not the owner", async () => {
    getPortfolio.mockResolvedValueOnce({ ...mockPortfolio, is_private: true });
    currentUser.mockResolvedValueOnce({ username: "someone_else" });

    await PortfolioPage({ params: mockParams });

    expect(notFound).toHaveBeenCalled();
  });

  test("renders selected template when portfolio is private but belongs to the user", async () => {
    getPortfolio.mockResolvedValueOnce({ ...mockPortfolio, is_private: true });
    currentUser.mockResolvedValueOnce({ username: "john123" });

    render(await PortfolioPage({ params: mockParams }));

    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
  });

  test("renders selected template when portfolio exists and is public", async () => {
    getPortfolio.mockResolvedValueOnce(mockPortfolio);
    currentUser.mockResolvedValueOnce(null);

    render(await PortfolioPage({ params: mockParams }));

    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
  });

  test("renders DefaultTemplate if template ID is invalid", async () => {
    getPortfolio.mockResolvedValueOnce({ ...mockPortfolio, template: 99 });
    currentUser.mockResolvedValueOnce(null);

    render(await PortfolioPage({ params: mockParams }));

    expect(screen.getByText("Default Template - John Doe")).toBeInTheDocument();
  });
});
