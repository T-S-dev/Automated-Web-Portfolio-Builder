import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Loader from "@/shared/components/Loader";

describe("Loader", () => {
  test("renders the loader with correct accessibility attributes", () => {
    render(<Loader />);

    const loaderContainer = screen.getByRole("status", { name: "Loading" });
    expect(loaderContainer).toBeInTheDocument();

    const spinner = loaderContainer.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("h-8 w-8 border-4 border-blue-500 border-t-transparent");
  });
});
