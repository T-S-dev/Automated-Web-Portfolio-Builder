import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dropzone from "@/features/portfolio/components/Dropzone";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@/shared/components/Loader", () => () => <div>Loader Mock</div>);

describe("Dropzone", () => {
  const mockFile = new File(["dummy content"], "resume.pdf", {
    type: "application/pdf",
  });

  const mockOnFileUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loader when processing is true", () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={true} />);
    expect(screen.getByText("Loader Mock")).toBeInTheDocument();
  });

  test("renders drop message when idle", () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={false} />);
    expect(screen.getByText("Click here or drop your resume to upload!")).toBeInTheDocument();
  });

  test("handles file drop successfully", async () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={false} />);

    const input = screen.getByLabelText("File upload");

    fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(mockFile);
    });
  });

  test("rejects files over 20MB", async () => {
    const largeFile = new File(["a"], "large.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(largeFile, "size", { value: 21 * 1024 * 1024 });

    render(<Dropzone onFileUpload={mockOnFileUpload} processing={false} />);

    const input = screen.getByLabelText("File upload");

    fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("File large.pdf is too large!");
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  test("ignores drop when processing is true", async () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={true} />);
    const input = screen.getByLabelText("File upload");

    fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    await waitFor(() => {
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  test("disables input when processing is true", () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={true} />);
    const input = screen.getByLabelText("File upload");
    expect(input).toBeDisabled();
  });

  test("enables input when processing is false", () => {
    render(<Dropzone onFileUpload={mockOnFileUpload} processing={false} />);
    const input = screen.getByLabelText("File upload");
    expect(input).not.toBeDisabled();
  });
});
