import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SignInPage from "@/app/(main)/(auth)/sign-in/[[...sign-in]]/page";

jest.mock("@/features/auth/components/SignInForm", () => () => <div data-testid="sign-in-form-mock" />);

describe("SignInPage", () => {
  test("renders the sign-in form and surrounding content", () => {
    render(<SignInPage />);

    expect(screen.getByRole("heading", { name: "Automated Web Portfolio Builder" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account to continue")).toBeInTheDocument();

    expect(screen.getByTestId("sign-in-form-mock")).toBeInTheDocument();
  });
});
