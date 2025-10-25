import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import AIEnhanceModal from "@/features/portfolio/components/AiEnhanceModal";

describe("AIEnhanceModal", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnAccept = jest.fn();
  const mockTitle = "Test AI Suggestions";
  const mockOriginal = "<p>This is the <strong>original</strong> text.</p>";
  const mockSuggestion = "<p>This is the <em>suggested</em> text.</p>";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render the dialog when 'open' prop is false", () => {
    render(
      <AIEnhanceModal
        open={false}
        onOpenChange={mockOnOpenChange}
        title={mockTitle}
        original={mockOriginal}
        suggestion={mockSuggestion}
        onAccept={mockOnAccept}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders the dialog with correct content when 'open' prop is true", () => {
    render(
      <AIEnhanceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title={mockTitle}
        original={mockOriginal}
        suggestion={mockSuggestion}
        onAccept={mockOnAccept}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(screen.getByText(mockTitle)).toBeInTheDocument();

    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(screen.getByText("Suggested by AI")).toBeInTheDocument();

    const originalSection = screen.getByText("Original").closest("div")?.querySelector("section > div");
    const suggestionSection = screen.getByText("Suggested by AI").closest("div")?.querySelector("section > div");

    expect(originalSection).toBeInTheDocument();
    expect(suggestionSection).toBeInTheDocument();
    expect(originalSection?.innerHTML).toBe(mockOriginal);
    expect(suggestionSection?.innerHTML).toBe(mockSuggestion);

    expect(screen.getByRole("button", { name: "Keep Original" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use Suggested" })).toBeInTheDocument();
  });

  test("calls onOpenChange(false) when 'Keep Original' button is clicked", () => {
    render(
      <AIEnhanceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title={mockTitle}
        original={mockOriginal}
        suggestion={mockSuggestion}
        onAccept={mockOnAccept}
      />,
    );

    const keepButton = screen.getByRole("button", { name: "Keep Original" });
    fireEvent.click(keepButton);

    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnAccept).not.toHaveBeenCalled();
  });

  test("calls onAccept when 'Use Suggested' button is clicked", () => {
    render(
      <AIEnhanceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title={mockTitle}
        original={mockOriginal}
        suggestion={mockSuggestion}
        onAccept={mockOnAccept}
      />,
    );

    const useButton = screen.getByRole("button", { name: "Use Suggested" });
    fireEvent.click(useButton);

    expect(mockOnAccept).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });
});
