import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PortfolioEditor from "@/components/PortfolioEditor";

jest.mock("@/components/PortfolioForm", () => ({ portfolioData, mode, onCancel }) => (
  <div data-testid="portfolio-form">
    PortfolioForm Mock - {mode}
    <button onClick={() => onCancel?.()}>Cancel</button>
    <div>{portfolioData?.personal?.name}</div>
  </div>
));

describe("PortfolioEditor", () => {
  const mockPortfolio = {
    personal: { name: "John Doe" },
  };

  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders PortfolioForm with correct props", () => {
    render(<PortfolioEditor portfolio={mockPortfolio} mode="edit" onCancel={mockCancel} />);
    expect(screen.getByTestId("portfolio-form")).toHaveTextContent("PortfolioForm Mock - edit");
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("renders iframe with correct src", () => {
    render(<PortfolioEditor portfolio={mockPortfolio} mode="edit" onCancel={mockCancel} />);
    const iframe = screen.getByTitle("Live Preview");
    expect(iframe).toHaveAttribute("src", expect.stringContaining("/live-preview"));
  });

  test("sends portfolio data via postMessage to iframe", async () => {
    const postMessageMock = jest.fn();

    render(<PortfolioEditor portfolio={mockPortfolio} mode="edit" onCancel={mockCancel} />);

    const iframe = screen.getByTitle("Live Preview");

    // Wait for the DOM to fully assign the iframe
    Object.defineProperty(iframe, "contentWindow", {
      writable: true,
      value: {
        postMessage: postMessageMock,
      },
    });

    window.postMessage({ status: "ready" }, "*");

    await waitFor(() => {
      expect(postMessageMock).toHaveBeenCalledWith(
        { portfolioData: mockPortfolio },
        expect.stringContaining("/live-preview"),
      );
    });
  });
});
