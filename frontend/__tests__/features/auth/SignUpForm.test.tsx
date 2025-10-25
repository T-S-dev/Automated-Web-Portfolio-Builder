import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { toast } from "sonner";
import SignUpForm from "@/features/auth/components/SignUpForm";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@clerk/nextjs", () => ({
  useSignUp: jest.fn(),
}));

jest.mock("@clerk/nextjs/errors", () => ({
  isClerkAPIResponseError: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockRouterPush = jest.fn();
const mockSignUpCreate = jest.fn();
const mockPrepareVerification = jest.fn();
const mockAttemptVerification = jest.fn();
const mockSetActive = jest.fn();

const mockUseSignUp = useSignUp as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockIsClerkAPIResponseError = isClerkAPIResponseError as unknown as jest.Mock;
const mockToastError = toast.error as jest.Mock;
const mockToastSuccess = toast.success as jest.Mock;

const fillSignUpForm = () => {
  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: "John" },
  });
  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { value: "Doe" },
  });
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "johndoe" },
  });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: "john@doe.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "StrongPassword123" },
  });
};

const navigateToVerificationScreen = async () => {
  mockSignUpCreate.mockResolvedValue({});
  mockPrepareVerification.mockResolvedValue({});
  render(<SignUpForm />);
  fillSignUpForm();
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
  await waitFor(() => {
    expect(screen.getByLabelText(/verification code input/i)).toBeInTheDocument();
  });
};

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
    });
    mockUseSignUp.mockReturnValue({
      isLoaded: true,
      signUp: {
        create: mockSignUpCreate,
        prepareEmailAddressVerification: mockPrepareVerification,
        attemptEmailAddressVerification: mockAttemptVerification,
      },
      setActive: mockSetActive,
    });
    mockIsClerkAPIResponseError.mockReturnValue(false);
  });

  describe("Step 1: Account Creation", () => {
    test("renders the initial form and the sign-in link", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/sign-in");
    });

    test("shows validation errors if fields are empty on submit", async () => {
      render(<SignUpForm />);
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(await screen.findByText("First Name is required")).toBeInTheDocument();
      expect(await screen.findByText("Last Name is required")).toBeInTheDocument();
      expect(await screen.findByText("Username must be at least 4 characters")).toBeInTheDocument();
      expect(await screen.findByText("Email is required/invalid")).toBeInTheDocument();
      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();

      expect(mockSignUpCreate).not.toHaveBeenCalled();
    });

    test("transitions to verification screen on successful sign-up", async () => {
      mockSignUpCreate.mockResolvedValue({});
      mockPrepareVerification.mockResolvedValue({});

      render(<SignUpForm />);
      fillSignUpForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(await screen.findByLabelText(/verification code input/i)).toBeInTheDocument();

      expect(mockSignUpCreate).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        emailAddress: "john@doe.com",
        password: "StrongPassword123",
      });
      expect(mockPrepareVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      });
    });

    test("handles Clerk API errors on sign-up", async () => {
      const mockClerkError = {
        errors: [
          {
            meta: { paramName: "username" },
            message: "That username is already taken.",
          },
        ],
      };
      mockSignUpCreate.mockRejectedValue(mockClerkError);
      mockIsClerkAPIResponseError.mockReturnValue(true);

      render(<SignUpForm />);
      fillSignUpForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(await screen.findByText("That username is already taken.")).toBeInTheDocument();
      expect(screen.queryByLabelText(/verification code input/i)).not.toBeInTheDocument();
    });

    test("handles generic errors on sign-up", async () => {
      mockSignUpCreate.mockRejectedValue(new Error("Network failed"));
      mockIsClerkAPIResponseError.mockReturnValue(false);

      render(<SignUpForm />);
      fillSignUpForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("An unexpected error occurred during sign up.");
      });

      expect(screen.queryByLabelText(/verification code input/i)).not.toBeInTheDocument();
    });
  });

  describe("Step 2: Email Verification", () => {
    beforeEach(async () => {
      await navigateToVerificationScreen();
    });

    test("shows error for empty verification code", async () => {
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));
      expect(await screen.findByText("Please enter the verification code.")).toBeInTheDocument();
      expect(mockAttemptVerification).not.toHaveBeenCalled();
    });

    test("shows error for short verification code", async () => {
      fireEvent.change(screen.getByLabelText(/verification code input/i), {
        target: { value: "123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));
      expect(await screen.findByText("Please enter a valid verification code.")).toBeInTheDocument();
      expect(mockAttemptVerification).not.toHaveBeenCalled();
    });

    test("handles successful verification and redirects", async () => {
      mockAttemptVerification.mockResolvedValue({
        status: "complete",
        createdSessionId: "sess_54321",
      });

      fireEvent.change(screen.getByLabelText(/verification code input/i), {
        target: { value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
      });

      expect(mockAttemptVerification).toHaveBeenCalledWith({ code: "123456" });
      expect(mockToastSuccess).toHaveBeenCalledWith("Sign up successful.");
      expect(mockSetActive).toHaveBeenCalledWith({ session: "sess_54321" });
    });

    test("handles Clerk API error (e.g., wrong code)", async () => {
      const mockClerkError = {
        errors: [{ longMessage: "The verification code is incorrect." }],
      };
      mockAttemptVerification.mockRejectedValue(mockClerkError);
      mockIsClerkAPIResponseError.mockReturnValue(true);

      fireEvent.change(screen.getByLabelText(/verification code input/i), {
        target: { value: "654321" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));

      expect(await screen.findByText("The verification code is incorrect.")).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    test("handles generic error on verification", async () => {
      mockAttemptVerification.mockRejectedValue(new Error("Network failed"));
      mockIsClerkAPIResponseError.mockReturnValue(false);

      fireEvent.change(screen.getByLabelText(/verification code input/i), {
        target: { value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));

      expect(await screen.findByText("An unexpected error occurred.")).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
