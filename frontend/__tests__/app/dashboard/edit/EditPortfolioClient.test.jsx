import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditPortfolioClient from "@/app/dashboard/edit/EditPortfolioClient";
import { useRouter } from "next/navigation";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/components/PortfolioEditor", () => {
  return ({ portfolio, mode, onCancel }) => (
    <div>
      <div>Portfolio Editor Mock - {mode}</div>
      <button onClick={onCancel}>Cancel Edit</button>
      <div>{portfolio?.personal?.name}</div>
    </div>
  );
});

describe("EditPortfolioClient", () => {
  const mockPortfolio = {
    personal: { name: "John Doe" },
  };

  test("renders PortfolioEditor with 'edit' mode and portfolio data", () => {
    render(<EditPortfolioClient portfolio={mockPortfolio} />);
    expect(screen.getByText("Portfolio Editor Mock - edit")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("calls router.push('/dashboard') on cancel", () => {
    render(<EditPortfolioClient portfolio={mockPortfolio} />);
    fireEvent.click(screen.getByText("Cancel Edit"));
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });
});
