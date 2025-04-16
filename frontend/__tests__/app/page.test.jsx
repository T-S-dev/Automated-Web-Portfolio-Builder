import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

describe("Home Page", () => {
  test("renders hero section correctly", () => {
    render(<Home />);

    expect(screen.getByText("Create Your Professional Portfolio in Seconds")).toBeInTheDocument();

    const getStartedLink = screen.getByRole("link", { name: "Get Started" });
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink).toHaveAttribute("href", "/sign-up");

    const dashboardLink = screen.getByRole("link", { name: "View Dashboard" });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  test("renders the How It Works section", () => {
    render(<Home />);

    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("1. Upload Your Resume")).toBeInTheDocument();
    expect(screen.getByText("2. Choose a Template")).toBeInTheDocument();
    expect(screen.getByText("3. Publish & Share")).toBeInTheDocument();
  });

  test("renders footer with correct year", () => {
    render(<Home />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`${currentYear} Automated Web Portfolio Builder.`)).toBeInTheDocument();
  });
});
