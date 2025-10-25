import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmModal from "@/shared/components/ConfirmModal";

describe("ConfirmModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: "Delete Portfolio?",
    description: "Are you sure you want to delete your portfolio? This action cannot be undone.",
    confirmText: "Yes, Delete Portfolio",
    cancelText: "Cancel",
    confirmVariant: "destructive" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render dialog content when isOpen is false", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: defaultProps.confirmText })).not.toBeInTheDocument();
  });

  test("renders with provided title and description", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Delete Portfolio?")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete your portfolio? This action cannot be undone."),
    ).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Yes, Delete Portfolio"));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  test("renders with default props when optional ones are omitted", () => {
    // Render only with required props
    render(<ConfirmModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Check for default text values
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });
});
