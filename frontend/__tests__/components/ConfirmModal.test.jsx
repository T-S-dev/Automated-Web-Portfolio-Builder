import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmModal from "@/components/ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Delete Portfolio?",
    description: "Are you sure you want to delete your portfolio? This action cannot be undone.",
    confirmText: "Yes, Delete Portfolio",
    cancelText: "Cancel",
    confirmVariant: "destructive",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with provided title and description", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Delete Portfolio?")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete your portfolio? This action cannot be undone.")).toBeInTheDocument();
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
});
