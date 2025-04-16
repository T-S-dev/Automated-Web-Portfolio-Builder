import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreatePortfolioClient from "@/app/dashboard/create/CreatePortfolioClient";
import axios from "axios";
import { toast } from "sonner";

jest.mock("axios");

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

let capturedOnFileUpload;

jest.mock("@/components/Dropzone", () => {
  return ({ onFileUpload, processing }) => {
    // Capture the onFileUpload prop so tests can simulate file uploads
    capturedOnFileUpload = onFileUpload;
    return <div>Dropzone Component Mock {processing ? "(Processing)" : ""}</div>;
  };
});

jest.mock("@/components/PortfolioEditor", () => {
  return ({ portfolio, mode, onCancel }) => <div>Portfolio Editor Mock</div>;
});

describe("CreatePortfolioClient", () => {
  test("renders Dropzone initially", () => {
    render(<CreatePortfolioClient />);
    expect(screen.getByText("Dropzone Component Mock")).toBeInTheDocument();
  });

  test("shows error when no file is uploaded", async () => {
    render(<CreatePortfolioClient />);

    await act(async () => {
      await capturedOnFileUpload(null);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No file uploaded");
    });
  });

  test("shows error for invalid file type", async () => {
    render(<CreatePortfolioClient />);
    const invalidFile = new File(["dummy content"], "dummy.txt", {
      type: "text/plain",
    });

    await act(async () => {
      await capturedOnFileUpload(invalidFile);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid file type. Please upload a PDF or DOCX file.");
    });
  });

  test("shows 'Processing' while waiting for resume parsing", async () => {
    // Mock axios.post to never resolve
    axios.post.mockImplementationOnce(() => new Promise(() => {}));

    render(<CreatePortfolioClient />);
    const validFile = new File(["dummy content"], "resume.pdf", { type: "application/pdf" });

    // Don't await the promise, just simulate the file upload, post will never resolve
    // This is to simulate the "Processing" state in the Dropzone component
    act(() => {
      capturedOnFileUpload(validFile);
    });

    // Check that "Processing" is displayed
    expect(screen.getByText("Dropzone Component Mock (Processing)")).toBeInTheDocument();
  });

  test("processes a valid file and renders PortfolioEditor", async () => {
    const dummyResumeData = {
      personal: { name: "John Doe" },
    };
    axios.post.mockResolvedValueOnce({ data: dummyResumeData });

    render(<CreatePortfolioClient />);
    const validFile = new File(["dummy content"], "dummy.pdf", {
      type: "application/pdf",
    });

    await act(async () => {
      await capturedOnFileUpload(validFile);
    });

    expect(screen.queryByText("Dropzone Component Mock")).not.toBeInTheDocument();

    expect(axios.post).toHaveBeenCalledWith("/api/parse-resume", expect.any(FormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    expect(toast.success).toHaveBeenCalledWith("Resume processed successfully!");

    expect(screen.getByText("Portfolio Editor Mock")).toBeInTheDocument();
  });
});
