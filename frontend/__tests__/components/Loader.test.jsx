import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loader from "@/components/Loader";

describe("Loader", () => {
  test("renders the loading spinner with appropriate role and label", () => {
    render(<Loader />);
    const loader = screen.getByRole("status", { name: "Loading" });
    expect(loader).toBeInTheDocument();
  });
});
