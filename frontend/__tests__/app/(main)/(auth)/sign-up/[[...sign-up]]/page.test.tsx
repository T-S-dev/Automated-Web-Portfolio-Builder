import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SignUpPage from "@/app/(main)/(auth)/sign-up/[[...sign-up]]/page";

jest.mock("@/features/auth/components/SignUpForm", () => () => <div data-testid="sign-up-form-mock" />);

describe("SignUpPage", () => {
  test("renders the sign-up form and surrounding content", () => {
    render(<SignUpPage />);

    expect(screen.getByRole("heading", { name: "Automated Web Portfolio Builder" })).toBeInTheDocument();
    expect(screen.getByText("Sign up to continue")).toBeInTheDocument();

    expect(screen.getByTestId("sign-up-form-mock")).toBeInTheDocument();
  });
});
