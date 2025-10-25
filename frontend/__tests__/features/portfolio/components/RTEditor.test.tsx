import { ReactElement } from "react";
import { render, fireEvent, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { UseFormSetValue, FieldValues, Path } from "react-hook-form";
import sanitizeHtml from "sanitize-html";

import RTEditor from "@/features/portfolio/components/RTEditor";

const mockChain = {
  focus: jest.fn().mockReturnThis(),
  toggleBold: jest.fn().mockReturnThis(),
  toggleItalic: jest.fn().mockReturnThis(),
  toggleUnderline: jest.fn().mockReturnThis(),
  setColor: jest.fn().mockReturnThis(),
  unsetColor: jest.fn().mockReturnThis(),
  run: jest.fn(),
};
const mockCommands = {
  setContent: jest.fn(),
};

const mockEditor: Partial<Editor> = {
  chain: () => mockChain as any,
  isActive: jest.fn(() => false),
  getHTML: jest.fn(() => ""),
  commands: mockCommands as any,
  isDestroyed: false,
};

let capturedOnUpdate: ({ editor }: { editor: Editor }) => void = () => {};

jest.mock("@tiptap/react", () => ({
  EditorContent: ({ editor }: { editor: Editor | null }) => (
    <div data-testid="editor-content" data-editor-content={editor?.getHTML() ?? ""} />
  ),

  useEditor: jest.fn((options) => {
    if (options?.onUpdate) {
      capturedOnUpdate = options.onUpdate;
    }
    return mockEditor as Editor;
  }),
}));

type TestFormValues = {
  testField: string;
  anotherField: number;
};

describe("RTEditor", () => {
  const mockName: Path<TestFormValues> = "testField";
  const mockSetValue: UseFormSetValue<TestFormValues> = jest.fn();
  const initialContent = "<p>Initial Content</p>";

  beforeEach(() => {
    jest.clearAllMocks();

    (mockEditor.isActive as jest.Mock).mockReturnValue(false);
    (mockEditor.getHTML as jest.Mock).mockReturnValue("");
    capturedOnUpdate = () => {};
  });

  test("initializes useEditor with correct extensions and initial content", () => {
    render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

    expect(useEditor).toHaveBeenCalledTimes(1);

    const editorOptions = (useEditor as jest.Mock).mock.calls[0][0];
    expect(editorOptions.content).toBe(initialContent);
    expect(editorOptions.extensions).toBeDefined();

    expect(editorOptions.extensions.length).toBeGreaterThan(5);
    expect(editorOptions.onUpdate).toEqual(expect.any(Function));
  });

  test("renders EditorContent", () => {
    render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  describe("onUpdate behavior", () => {
    test("calls setValue with sanitized HTML", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
      expect(capturedOnUpdate).toBeDefined();

      const dirtyHtml = "<p>Hello <strong>World</strong><script>alert('xss')</script></p>";
      const expectedCleanHtml = "<p>Hello <strong>World</strong></p>";
      (mockEditor.getHTML as jest.Mock).mockReturnValue(dirtyHtml);

      act(() => {
        capturedOnUpdate({ editor: mockEditor as Editor });
      });

      expect(mockSetValue).toHaveBeenCalledTimes(1);
      expect(mockSetValue).toHaveBeenCalledWith(mockName, expectedCleanHtml);
    });

    test("calls setValue with empty string for empty paragraph", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
      expect(capturedOnUpdate).toBeDefined();

      const emptyHtml = "<p></p>";
      (mockEditor.getHTML as jest.Mock).mockReturnValue(emptyHtml);

      act(() => {
        capturedOnUpdate({ editor: mockEditor as Editor });
      });

      expect(mockSetValue).toHaveBeenCalledTimes(1);
      expect(mockSetValue).toHaveBeenCalledWith(mockName, "", { shouldValidate: true, shouldDirty: true });
    });
    test("calls setValue with shouldValidate and shouldDirty options when setting empty string", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
      expect(capturedOnUpdate).toBeDefined();

      const emptyHtml = "<p></p>";
      (mockEditor.getHTML as jest.Mock).mockReturnValue(emptyHtml);

      act(() => {
        capturedOnUpdate({ editor: mockEditor as Editor });
      });

      expect(mockSetValue).toHaveBeenCalledWith(mockName, "", { shouldValidate: true, shouldDirty: true });
    });
  });

  describe("Toolbar Interaction", () => {
    test("toolbar buttons call correct editor chain methods", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

      fireEvent.click(screen.getByLabelText("Toggle Bold"));
      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockChain.toggleBold).toHaveBeenCalled();
      expect(mockChain.run).toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText("Toggle Italic"));
      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockChain.toggleItalic).toHaveBeenCalled();
      expect(mockChain.run).toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText("Toggle Underline"));
      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockChain.toggleUnderline).toHaveBeenCalled();
      expect(mockChain.run).toHaveBeenCalled();
    });

    test("color picker input change calls setColor", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
      const colorInput = screen.getByLabelText("Color Picker");

      fireEvent.change(colorInput, { target: { value: "#ff0000" } });

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockChain.setColor).toHaveBeenCalledWith("#ff0000");
      expect(mockChain.run).toHaveBeenCalled();
    });

    test("reset color button calls unsetColor", () => {
      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);
      const resetButton = screen.getByRole("button", { name: "Reset Color" });

      fireEvent.click(resetButton);

      expect(mockChain.focus).toHaveBeenCalled();
      expect(mockChain.unsetColor).toHaveBeenCalled();
      expect(mockChain.run).toHaveBeenCalled();
    });

    test("toolbar buttons reflect isActive state", () => {
      (mockEditor.isActive as jest.Mock).mockImplementation((type) => type === "bold");

      render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

      const boldButton = screen.getByLabelText("Toggle Bold");
      const italicButton = screen.getByLabelText("Toggle Italic");

      expect(boldButton).toHaveClass("border-gray-600");
      expect(italicButton).toHaveClass("border-transparent");
      expect(italicButton).not.toHaveClass("border-gray-600");
    });
  });

  test("renders extraToolbarButtons", () => {
    const ExtraButton = () => <button>Extra Action</button>;
    render(
      <RTEditor
        name={mockName}
        setValue={mockSetValue}
        content={initialContent}
        extraToolbarButtons={[<ExtraButton key="extra1" />]}
      />,
    );

    expect(screen.getByRole("button", { name: "Extra Action" })).toBeInTheDocument();
  });

  test("useEffect updates editor content when 'content' prop changes", () => {
    const newContent = "<p>Updated Content</p>";
    const { rerender } = render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

    mockCommands.setContent.mockClear();

    rerender(<RTEditor name={mockName} setValue={mockSetValue} content={newContent} />);

    expect(mockCommands.setContent).toHaveBeenCalledTimes(1);
    expect(mockCommands.setContent).toHaveBeenCalledWith(newContent, { emitUpdate: false });

    expect(mockSetValue).not.toHaveBeenCalled();
  });

  test("useEffect does not call setContent if prop content is same as editor content", () => {
    const sanitizedInitialContent = sanitizeHtml(initialContent);
    (mockEditor.getHTML as jest.Mock).mockReturnValue(sanitizedInitialContent);

    const { rerender } = render(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

    rerender(<RTEditor name={mockName} setValue={mockSetValue} content={initialContent} />);

    expect(mockCommands.setContent).not.toHaveBeenCalled();
  });
});
