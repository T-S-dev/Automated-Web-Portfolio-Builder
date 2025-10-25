import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import PortfolioPage, { generateMetadata } from "@/app/(portfolio)/portfolio/[username]/page";
import { getPortfolioByUsername } from "@/features/portfolio/services";

import { Portfolio } from "@/types";

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/features/portfolio/services", () => ({
  getPortfolioByUsername: jest.fn(),
}));

jest.mock("@/features/template/lib/TemplateMappings", () => {
  // Define the mock functions *inside* the factory scope
  const MockTemplate1 = jest.fn(({ portfolio }: { portfolio: Portfolio }) => (
    <div>Template 1 - {portfolio.personal.name}</div>
  ));
  const MockDefaultTemplate = jest.fn(({ portfolio }: { portfolio: Portfolio }) => (
    <div>Default Template - {portfolio.personal.name}</div>
  ));

  // Expose the mocks for assertion later if needed (optional but good practice)
  // We can use a property on the mocked module itself
  return {
    __esModule: true, // Indicates it's an ES Module
    TemplateMappings: {
      1: MockTemplate1,
    },
    DefaultTemplate: MockDefaultTemplate,
    // Expose mocks for testing
    _MockTemplate1: MockTemplate1,
    _MockDefaultTemplate: MockDefaultTemplate,
  };
});

const mockedCurrentUser = currentUser as jest.Mock;
const mockedGetPortfolio = getPortfolioByUsername as jest.Mock;
const { _MockTemplate1: MockTemplate1, _MockDefaultTemplate: MockDefaultTemplate } = jest.requireMock(
  "@/features/template/lib/TemplateMappings",
);

const createProps = (username: string) => ({
  params: Promise.resolve({ username }),
});

describe("PortfolioPage", () => {
  const mockFullPortfolio = {
    is_private: false,
    clerkId: "clerk_123",
    username: "johndoe",
    createdAt: new Date(),
    updatedAt: new Date(),
    template: 1,
    personal: { name: "John Doe" },
    skills: ["React"],
  };

  const expectedClientPortfolio = {
    template: 1,
    personal: { name: "John Doe" },
    skills: ["React"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls notFound if no portfolio is found", async () => {
    mockedGetPortfolio.mockResolvedValue(null);
    mockedCurrentUser.mockResolvedValue(null);

    const props = createProps("johndoe");
    await PortfolioPage(props);

    expect(mockedGetPortfolio).toHaveBeenCalledWith("johndoe");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test("calls notFound if fetching portfolio throws an error", async () => {
    mockedGetPortfolio.mockRejectedValue(new Error("DB Error"));
    mockedCurrentUser.mockResolvedValue(null);

    const props = createProps("johndoe");
    await PortfolioPage(props);

    expect(mockedGetPortfolio).toHaveBeenCalledWith("johndoe");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test("calls notFound if portfolio is private and user is not owner", async () => {
    mockedGetPortfolio.mockResolvedValue({ ...mockFullPortfolio, is_private: true });
    mockedCurrentUser.mockResolvedValue({ username: "someone_else" });

    const props = createProps("johndoe");
    await PortfolioPage(props);

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test("renders selected template when portfolio is private but belongs to the user", async () => {
    mockedGetPortfolio.mockResolvedValue({ ...mockFullPortfolio, is_private: true });
    mockedCurrentUser.mockResolvedValue({ username: "johndoe" });

    const props = createProps("johndoe");
    const Page = await PortfolioPage(props);
    render(Page);

    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
    expect(MockTemplate1).toHaveBeenCalledWith({ portfolio: expectedClientPortfolio }, undefined);
  });

  test("renders selected template when portfolio exists and is public", async () => {
    mockedGetPortfolio.mockResolvedValue(mockFullPortfolio);
    mockedCurrentUser.mockResolvedValue(null);

    const props = createProps("johndoe");
    const Page = await PortfolioPage(props);
    render(Page);

    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
    expect(MockTemplate1).toHaveBeenCalledWith({ portfolio: expectedClientPortfolio }, undefined);
  });

  test("renders DefaultTemplate if template ID is invalid", async () => {
    mockedGetPortfolio.mockResolvedValue({ ...mockFullPortfolio, template: 9999 });
    mockedCurrentUser.mockResolvedValue(null);

    const props = createProps("johndoe");
    const Page = await PortfolioPage(props);
    render(Page);

    expect(screen.getByText("Default Template - John Doe")).toBeInTheDocument();
    expect(MockDefaultTemplate).toHaveBeenCalledWith(
      { portfolio: { ...expectedClientPortfolio, template: 9999 } },
      undefined,
    );
  });
});

describe("generateMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 'Not Found' title if portfolio is not found", async () => {
    mockedGetPortfolio.mockResolvedValue(null);

    const props = createProps("unknown");
    const metadata = await generateMetadata(props);

    expect(metadata).toEqual({ title: "Portfolio Not Found" });
  });

  test("returns correct metadata with 's for name not ending in s", async () => {
    mockedGetPortfolio.mockResolvedValue({
      personal: { name: "John Doe" },
    });

    const props = createProps("johndoe");
    const metadata = await generateMetadata(props);

    expect(metadata).toEqual({
      title: "John Doe's Portfolio | Automated Web Portfolio Builder",
      description: "View John Doe's online portfolio, generated automatically from their resume.",
    });
  });

  test("returns correct metadata with ' for name ending in s", async () => {
    mockedGetPortfolio.mockResolvedValue({
      personal: { name: "James Williams" },
    });

    const props = createProps("jamesw");
    const metadata = await generateMetadata(props);

    expect(metadata).toEqual({
      title: "James Williams' Portfolio | Automated Web Portfolio Builder",
      description: "View James Williams' online portfolio, generated automatically from their resume.",
    });
  });
});
