import { render, screen, waitFor } from "@testing-library/react";
import LivePreview from "@/app/live-preview/page";
import { notFound } from "next/navigation";

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

describe("LivePreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls notFound when not in iframe", () => {
    render(<LivePreview />);
    expect(notFound).toHaveBeenCalled();
  });

  test("renders Loader initially", () => {
    Object.defineProperty(window, "self", {
      value: { ...window.self, top: null },
    });

    render(<LivePreview />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  test("renders correct template after receiving message", async () => {
    Object.defineProperty(window, "self", {
      value: { ...window.self, top: null },
    });

    render(<LivePreview />);

    const mockPortfolio = {
      template: 1,
      personal: { name: "John Doe" },
    };

    window.postMessage({ portfolioData: mockPortfolio }, "*");

    await waitFor(() => {
      expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
    });
  });

  test("renders default template if unknown template ID", async () => {
    Object.defineProperty(window, "self", {
      value: { ...window.self, top: null },
    });

    render(<LivePreview />);

    const mockPortfolio = {
      template: 99,
      personal: { name: "John Doe" },
    };

    window.postMessage({ portfolioData: mockPortfolio }, "*");

    await waitFor(() => {
      expect(screen.getByText("Default Template - John Doe")).toBeInTheDocument();
    });
  });
});
