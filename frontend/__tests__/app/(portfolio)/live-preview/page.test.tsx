import { render, screen, waitFor } from "@testing-library/react";
import { notFound } from "next/navigation";

import LivePreview from "@/app/(portfolio)/live-preview/page";

import { Portfolio } from "@/types";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/shared/components/Loader", () => jest.fn(() => <div data-testid="loader-mock" />));

jest.mock("@/features/template/lib/TemplateMappings", () => ({
  TemplateMappings: {
    1: ({ portfolio }: { portfolio: Portfolio }) => <div>Template 1 - {portfolio.personal.name}</div>,
    2: ({ portfolio }: { portfolio: Portfolio }) => <div>Template 2 - {portfolio.personal.name}</div>,
  },
  DefaultTemplate: ({ portfolio }: { portfolio: Portfolio }) => <div>Default Template - {portfolio.personal.name}</div>,
}));

describe("LivePreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls notFound when not in iframe", () => {
    render(<LivePreview />);
    expect(notFound).toHaveBeenCalled();
  });

  test('sends "ready" message to parent when in iframe', () => {
    const mockParentPostMessage = jest.fn();

    Object.defineProperty(window, "parent", {
      value: { postMessage: mockParentPostMessage },
    });

    Object.defineProperty(window, "self", {
      value: { ...window.self, top: null },
    });

    render(<LivePreview />);

    expect(mockParentPostMessage).toHaveBeenCalledTimes(1);
    expect(mockParentPostMessage).toHaveBeenCalledWith({ status: "ready" }, "*");
  });

  test("renders Loader initially", () => {
    Object.defineProperty(window, "self", {
      value: { ...window.self, top: null },
    });

    render(<LivePreview />);
    expect(screen.getByTestId("loader-mock")).toBeInTheDocument();
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
