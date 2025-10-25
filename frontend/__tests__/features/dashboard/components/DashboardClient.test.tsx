import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import DashboardClient from "@/features/dashboard/components/DashboardClient";

import { deletePortfolioAction, togglePrivacyAction } from "@/features/portfolio/actions";

import type { DashboardPortfolio } from "@/types";

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/features/portfolio/actions", () => ({
  deletePortfolioAction: jest.fn(),
  togglePrivacyAction: jest.fn(),
}));

let capturedOnConfirm = () => {};
jest.mock("@/shared/components/ConfirmModal", () => {
  const MockConfirmModal = jest.fn((props) => {
    if (props.isOpen) {
      capturedOnConfirm = props.onConfirm;
      return (
        <div data-testid="confirm-modal-mock">
          <button onClick={props.onConfirm}>{props.confirmText}</button>
          <button onClick={props.onClose}>{props.cancelText}</button>
        </div>
      );
    }
    return null;
  });
  return MockConfirmModal;
});

const mockedUseUser = useUser as jest.Mock;
const mockedDeleteAction = deletePortfolioAction as jest.Mock;
const mockedToggleAction = togglePrivacyAction as jest.Mock;
const mockedToastError = toast.error as jest.Mock;
const mockedToastSuccess = toast.success as jest.Mock;
const mockedConfirmModal = jest.requireMock("@/shared/components/ConfirmModal") as jest.Mock;

describe("DashboardClient", () => {
  const mockPortfolio: DashboardPortfolio = {
    personal: {
      name: "John Doe",
    },
    is_private: true,
    username: "johndoe",
  };

  const writeTextMock = jest.fn();
  beforeAll(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUser.mockReturnValue({ user: { username: "johndoe" } });
  });

  // --- Static Rendering Tests ---

  test("renders portfolio data and buttons for a private portfolio", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);

    expect(screen.getByText("John Doe's Portfolio")).toBeInTheDocument();

    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(screen.queryByText("Public")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /View Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy Link/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete Portfolio/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Make Public/i })).toBeInTheDocument();
  });

  test("renders correct state for a public portfolio", () => {
    render(<DashboardClient portfolio={{ ...mockPortfolio, is_private: false }} />);

    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Make Private/i })).toBeInTheDocument();
  });

  test("view portfolio link directs to the correct URL", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);
    const viewLink = screen.getByRole("link", { name: /View Portfolio/i });
    expect(viewLink).toHaveAttribute("href", `/portfolio/johndoe`);
    expect(viewLink).toHaveAttribute("target", `_blank`);
  });

  test("edit portfolio link directs to the correct URL", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);
    const editLink = screen.getByRole("link", { name: /Edit Portfolio/i });
    expect(editLink).toHaveAttribute("href", `/dashboard/edit`);
  });

  // --- Interaction Tests ---

  describe("Toggle Privacy", () => {
    test("successfully toggles privacy from private to public", async () => {
      // 1. Setup: Start as private, action will return public
      mockedToggleAction.mockResolvedValue({
        success: true,
        data: { is_private: false },
      });
      render(<DashboardClient portfolio={mockPortfolio} />);

      // 2. Find and click the button
      const toggleButton = screen.getByRole("button", { name: /Make Public/i });
      fireEvent.click(toggleButton);

      // 3. Assert loading state (briefly)
      expect(toggleButton).toBeDisabled();
      expect(toggleButton.querySelector(".animate-spin")).toBeInTheDocument();

      // 4. Wait for action to resolve and UI to update
      await waitFor(() => {
        // Check API call
        expect(mockedToggleAction).toHaveBeenCalledWith(false); // We clicked "Make Public", so we pass `false`

        // Check UI updated
        expect(screen.getByText("Public")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Make Private/i })).toBeInTheDocument();
        expect(toggleButton).not.toBeDisabled();
      });
    });

    test("handles failure when toggling privacy", async () => {
      // 1. Setup: Action will return an error
      mockedToggleAction.mockResolvedValue({
        success: false,
        error: "Toggle failed. Please try again.",
      });
      render(<DashboardClient portfolio={mockPortfolio} />);

      // 2. Find and click the button
      const toggleButton = screen.getByRole("button", { name: /Make Public/i });
      fireEvent.click(toggleButton);

      // 3. Wait for action to resolve and toast to appear
      await waitFor(() => {
        expect(mockedToastError).toHaveBeenCalledWith("Toggle failed. Please try again.");
      });

      // 4. Assert UI did NOT change
      expect(screen.getByText("Private")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Make Public/i })).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });
  });

  describe("Delete Portfolio", () => {
    test("opens modal and successfully deletes portfolio on confirm", async () => {
      mockedDeleteAction.mockResolvedValue({ success: true });
      render(<DashboardClient portfolio={mockPortfolio} />);

      fireEvent.click(screen.getByRole("button", { name: /Delete Portfolio/i }));

      expect(mockedConfirmModal).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: true }), undefined);
      const confirmButton = screen.getByText("Yes, Delete Portfolio");
      expect(confirmButton).toBeInTheDocument();

      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockedDeleteAction).toHaveBeenCalledTimes(1);
      });

      expect(mockedConfirmModal).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: false }), undefined);
    });

    test("handles failure when deleting portfolio", async () => {
      // 1. Setup: Action will fail
      mockedDeleteAction.mockResolvedValue({
        success: false,
        error: "Delete failed.",
      });
      render(<DashboardClient portfolio={mockPortfolio} />);

      // 2. Open the modal and click confirm
      fireEvent.click(screen.getByRole("button", { name: /Delete Portfolio/i }));
      const confirmButton = await screen.findByText("Yes, Delete Portfolio");
      fireEvent.click(confirmButton);

      // 3. Wait for action to resolve and toast to appear
      await waitFor(() => {
        expect(mockedDeleteAction).toHaveBeenCalledTimes(1);
        expect(mockedToastError).toHaveBeenCalledWith("Delete failed.");
      });
    });
  });

  describe("Copy to Clipboard", () => {
    test("copies correct URL to clipboard and shows success toast", async () => {
      // 1. Setup: Clipboard write will succeed
      writeTextMock.mockResolvedValue(undefined);
      render(<DashboardClient portfolio={mockPortfolio} />);

      // 2. Click the copy button
      fireEvent.click(screen.getByRole("button", { name: /Copy Link/i }));

      // 3. Wait for clipboard and toast
      await waitFor(() => {
        const expectedUrl = `${window.location.origin}/portfolio/johndoe`;
        expect(writeTextMock).toHaveBeenCalledWith(expectedUrl);
        expect(mockedToastSuccess).toHaveBeenCalledWith("Portfolio link copied to clipboard!");
      });
    });

    test("shows error toast if clipboard write fails", async () => {
      // 1. Setup: Clipboard write will fail
      writeTextMock.mockRejectedValue(new Error("Copy failed"));
      render(<DashboardClient portfolio={mockPortfolio} />);

      // 2. Click the copy button
      fireEvent.click(screen.getByRole("button", { name: /Copy Link/i }));

      // 3. Wait for toast
      await waitFor(() => {
        expect(mockedToastError).toHaveBeenCalledWith("Failed to copy link to clipboard");
      });
    });
  });
});
