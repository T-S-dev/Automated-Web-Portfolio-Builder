import { render, fireEvent, screen } from "@testing-library/react";
import RTEditor from "@/components/RTEditor";
import "@testing-library/jest-dom";
import { useEditor } from "@tiptap/react";

jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(),
  EditorContent: () => <div data-testid="editor-content" />,
}));

const mockChain = {
  focus: jest.fn().mockReturnThis(),
  toggleBold: jest.fn().mockReturnThis(),
  toggleItalic: jest.fn().mockReturnThis(),
  toggleUnderline: jest.fn().mockReturnThis(),
  setColor: jest.fn().mockReturnThis(),
  unsetColor: jest.fn().mockReturnThis(),
  run: jest.fn(),
};

const mockEditor = {
  chain: () => mockChain,
  isActive: () => false,
  getHTML: () => "",
  commands: { setContent: jest.fn() },
};

describe("RTEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEditor.mockReturnValue(mockEditor);
  });

  test("calls setValue with sanitised HTML on update", () => {
    const mockSetValue = jest.fn();

    render(<RTEditor name="test" setValue={mockSetValue} defaultValue="<p>Hello</p>" />);

    mockEditor.getHTML = () => "<p></p>";
    // simulate onUpdate manually
    // calls[0][0] is the first argument of the first call to useEditor
    useEditor.mock.calls[0][0].onUpdate({ editor: mockEditor });
    expect(mockSetValue).toHaveBeenCalledWith("test", "");

    mockEditor.getHTML = () => "<p><script>alert('hello')</script><strong>Safe</strong></p>";
    useEditor.mock.calls[0][0].onUpdate({ editor: mockEditor });
    expect(mockSetValue).toHaveBeenCalledWith("test", "<p><strong>Safe</strong></p>");
  });

  test("toolbar buttons call the correct editor chain methods", () => {
    render(<RTEditor name="test" setValue={jest.fn()} defaultValue="<p>Hello</p>" />);

    fireEvent.click(screen.getByLabelText("Toggle Bold"));
    expect(mockChain.toggleBold).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Toggle Italic"));
    expect(mockChain.toggleItalic).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Toggle Underline"));
    expect(mockChain.toggleUnderline).toHaveBeenCalled();
  });

  test("color picker sets and resets colour", () => {
    render(<RTEditor name="test" setValue={jest.fn()} defaultValue="<p>Hello</p>" />);

    const colorInput = screen.getByLabelText("Color Picker");
    fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    expect(mockChain.setColor).toHaveBeenCalledWith("#ff0000");

    const resetButton = screen.getByText("Reset Color");
    fireEvent.click(resetButton);
    expect(mockChain.unsetColor).toHaveBeenCalled();
  });
});
