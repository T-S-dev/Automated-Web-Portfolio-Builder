import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import CreatePortfolioPrompt from "@/features/dashboard/components/CreatePortfolioPrompt";

describe("CreatePortfolioPrompt", () => {
  test("renders the prompt text and the 'Create Portfolio' link", () => {
    render(<CreatePortfolioPrompt />);

    expect(screen.getByText("You haven't created a portfolio yet.")).toBeInTheDocument();

    const createLink = screen.getByRole("link", {
      name: "Create Portfolio",
    });

    expect(createLink).toBeInTheDocument();

    expect(createLink).toHaveAttribute("href", "/dashboard/create");
  });
});
