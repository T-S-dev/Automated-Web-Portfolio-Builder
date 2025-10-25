import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import SignInForm from "@/features/auth/components/SignInForm";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@clerk/nextjs", () => ({
  useSignIn: jest.fn(),
}));

jest.mock("@clerk/nextjs/errors", () => ({
  isClerkAPIResponseError: jest.fn(),
}));

const mockRouterReplace = jest.fn();
const mockSignInCreate = jest.fn();
const mockSetActive = jest.fn();
const mockUseSignIn = useSignIn as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockIsClerkAPIResponseError = isClerkAPIResponseError as unknown as jest.Mock;

describe("SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      replace: mockRouterReplace,
    });

    mockUseSignIn.mockReturnValue({
      isLoaded: true,
      signIn: {
        create: mockSignInCreate,
      },
      setActive: mockSetActive,
    });

    mockIsClerkAPIResponseError.mockReturnValue(false);
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/email\/username/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
  };

  test("renders the form and the sign-up link", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email\/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();

    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });

  test("shows validation errors if fields are empty on submit", async () => {
    render(<SignInForm />);
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.click(submitButton);

    expect(await screen.findByText("Email/Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();

    expect(mockSignInCreate).not.toHaveBeenCalled();
  });

  test("handles successful sign-in and redirection (happy path)", async () => {
    mockSignInCreate.mockResolvedValue({
      status: "complete",
      createdSessionId: "sess_12345",
    });

    render(<SignInForm />);
    fillForm();
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
    });

    expect(mockSignInCreate).toHaveBeenCalledWith({
      identifier: "test@example.com",
      password: "password123",
    });

    expect(mockSetActive).toHaveBeenCalledWith({ session: "sess_12345" });

    expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
  });

  test("handles Clerk API errors (e.g., wrong password)", async () => {
    const mockClerkError = {
      errors: [
        {
          meta: { paramName: "password" },
          message: "That password was incorrect.",
        },
      ],
    };
    mockSignInCreate.mockRejectedValue(mockClerkError);
    mockIsClerkAPIResponseError.mockReturnValue(true);

    render(<SignInForm />);
    fillForm();
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitButton);

    expect(await screen.findByText("That password was incorrect.")).toBeInTheDocument();

    expect(mockRouterReplace).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "Sign In" })).not.toBeDisabled();
  });

  test("handles generic/network errors", async () => {
    mockSignInCreate.mockRejectedValue(new Error("Network connection failed"));
    mockIsClerkAPIResponseError.mockReturnValue(false);

    render(<SignInForm />);
    fillForm();
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitButton);

    expect(await screen.findByText("An unexpected error occurred.")).toBeInTheDocument();

    expect(mockRouterReplace).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "Sign In" })).not.toBeDisabled();
  });
});
