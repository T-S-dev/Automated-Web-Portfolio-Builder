import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";

import EditPortfolioClient from "@/app/(main)/dashboard/edit/EditPortfolioClient";

import { Portfolio } from "@/types";

const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
  })),
}));

jest.mock("@/features/portfolio/components/PortfolioEditor", () => {
  return jest.fn(({ portfolio, mode, onCancel }: { portfolio: Portfolio; mode: string; onCancel: () => void }) => (
    <div data-testid="portfolio-editor-mock">
      {/* Render identifiable info */}
      <span>Mode: {mode}</span>
      <span>Name: {portfolio?.personal?.name}</span>
      <button onClick={onCancel}>Cancel Edit</button>
    </div>
  ));
});

const MockedPortfolioEditor = jest.requireMock("@/features/portfolio/components/PortfolioEditor") as jest.Mock;

describe("EditPortfolioClient", () => {
  const mockPortfolio: Portfolio = {
    template: 1,
    personal: { name: "John Doe", job_title: "", email: "", phone: "", linkedin: "", github: "", location: "" },
    professional_summary: "",
    education: [],
    experience: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders PortfolioEditor with 'edit' mode and portfolio data", () => {
    render(<EditPortfolioClient portfolio={mockPortfolio} />);

    // Check that the mock editor rendered
    const editorMock = screen.getByTestId("portfolio-editor-mock");
    expect(editorMock).toBeInTheDocument();

    // Check content rendered by the mock based on props
    expect(editorMock).toHaveTextContent("Mode: edit");
    expect(editorMock).toHaveTextContent("Name: John Doe");

    expect(MockedPortfolioEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        portfolio: mockPortfolio,
        mode: "edit",
      }),
      undefined,
    );
  });

  test("calls router.push('/dashboard') on cancel", () => {
    render(<EditPortfolioClient portfolio={mockPortfolio} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel Edit" });
    fireEvent.click(cancelButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
  });
});
