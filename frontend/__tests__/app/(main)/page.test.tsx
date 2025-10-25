import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "@/app/(main)/page";

describe("Home Page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  test("renders hero section correctly", () => {
    expect(screen.getByRole("heading", { name: /Your Professional Portfolio in Seconds/i })).toBeInTheDocument();

    expect(screen.getByText(/Upload your resume, choose from beautiful templates/i)).toBeInTheDocument();

    const getStartedLink = screen.getByRole("link", { name: /Get Started Free/i });
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink).toHaveAttribute("href", "/sign-up");

    expect(screen.getByText("Lightning fast setup")).toBeInTheDocument();
    expect(screen.getByText("Secure & private")).toBeInTheDocument();
    expect(screen.getByText("No coding required")).toBeInTheDocument();
  });

  test("renders the See It In Action section correctly", () => {
    expect(screen.getByRole("heading", { name: /Watch How Easy It Is/i })).toBeInTheDocument();

    expect(screen.getByText(/From resume upload to live portfolio/i)).toBeInTheDocument();

    const video = screen.getByLabelText("Portfolio creation demo video");
    expect(video).toBeInTheDocument();
  });

  test("renders the How It Works section", () => {
    expect(screen.getByRole("heading", { name: /Three Steps to Success/i })).toBeInTheDocument();

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload Resume" })).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose Template" })).toBeInTheDocument();

    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Publish & Share" })).toBeInTheDocument();
  });

  test("renders the CTA section correctly", () => {
    expect(screen.getByRole("heading", { name: /Ready to Stand Out?/i })).toBeInTheDocument();

    const ctaLink = screen.getByRole("link", { name: /Create Your Portfolio Now/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/sign-up");
  });
});
