import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "sonner";

import CreatePortfolioClient from "@/app/(main)/dashboard/create/CreatePortfolioClient";
import { parseResumeAction } from "@/features/portfolio/actions";
import { normalizeParsedResume } from "@/shared/lib/normalizeResume";

import { ParsedResume, Portfolio } from "@/types";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/features/portfolio/actions", () => ({
  parseResumeAction: jest.fn(),
}));

const mockNormalizedData: Portfolio = {
  template: 1,
  personal: {
    name: "Normalized Name",
    job_title: "Job Title",
    email: "norm@test.com",
    phone: "",
    linkedin: "",
    github: "",
    location: "",
  },
  professional_summary: "Normalized summary.",
  education: [],
  experience: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
};
jest.mock("@/shared/lib/normalizeResume", () => ({
  normalizeParsedResume: jest.fn((_parsedData: ParsedResume): Portfolio => mockNormalizedData),
}));

let capturedOnFileUpload: (file: File) => void;
jest.mock("@/features/portfolio/components/Dropzone", () => {
  return jest.fn(({ onFileUpload, processing }) => {
    capturedOnFileUpload = onFileUpload;
    return <div data-testid="dropzone-mock">Dropzone Mock {processing ? "(Processing)" : ""}</div>;
  });
});

let capturedOnCancel: () => void;
jest.mock("@/features/portfolio/components/PortfolioEditor", () => {
  return jest.fn(({ portfolio, mode, onCancel }) => {
    capturedOnCancel = onCancel;
    return (
      <div data-testid="portfolio-editor-mock">
        Portfolio Editor Mock (Mode: {mode})<span>Name: {portfolio?.personal?.name || "N/A"}</span>
      </div>
    );
  });
});

const mockedParseAction = parseResumeAction as jest.Mock;
const mockedToastError = toast.error as jest.Mock;
const mockedNormalize = normalizeParsedResume as jest.Mock;
const MockedPortfolioEditor = jest.requireMock("@/features/portfolio/components/PortfolioEditor") as jest.Mock;

describe("CreatePortfolioClient", () => {
  const mockFile = new File(["dummy resume content"], "resume.pdf", {
    type: "application/pdf",
  });

  const dummyParsedData: ParsedResume = {
    personal: {
      name: "John From Resume",
      job_title: null,
      email: null,
      phone: null,
      linkedin: null,
      github: null,
      location: null,
    },
    professional_summary: null,
    education: [],
    experience: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnFileUpload = () => {};
    capturedOnCancel = () => {};
  });

  test("renders Dropzone initially", () => {
    render(<CreatePortfolioClient />);
    expect(screen.getByTestId("dropzone-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("portfolio-editor-mock")).not.toBeInTheDocument();
  });

  test("shows processing state in Dropzone during file upload", async () => {
    mockedParseAction.mockImplementation(() => new Promise(() => {}));
    render(<CreatePortfolioClient />);
    expect(capturedOnFileUpload).toBeDefined();

    await act(async () => {
      if (capturedOnFileUpload) {
        capturedOnFileUpload(mockFile);
      }
    });

    expect(screen.getByText(/Dropzone Mock \(Processing\)/i)).toBeInTheDocument();
  });

  test("processes valid file, normalizes data, and renders PortfolioEditor", async () => {
    mockedParseAction.mockResolvedValue({ success: true, data: dummyParsedData });
    // The mock normalizer will return mockNormalizedData regardless of input now
    // mockedNormalize.mockReturnValue(mockNormalizedData); // This is implicitly done by the jest.mock above

    render(<CreatePortfolioClient />);
    expect(capturedOnFileUpload).toBeDefined();

    await act(async () => {
      if (capturedOnFileUpload) {
        capturedOnFileUpload(mockFile);
      }
    });

    await waitFor(() => {
      expect(mockedParseAction).toHaveBeenCalledTimes(1);
      const formDataArg = mockedParseAction.mock.calls[0][0] as FormData;
      expect(formDataArg.get("file")).toBe(mockFile);

      expect(mockedNormalize).toHaveBeenCalledWith(dummyParsedData);

      expect(screen.getByTestId("portfolio-editor-mock")).toBeInTheDocument();
      expect(screen.queryByTestId("dropzone-mock")).not.toBeInTheDocument();

      expect(MockedPortfolioEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolio: mockNormalizedData,
          mode: "create",
        }),
        undefined,
      );

      expect(screen.getByText("Name: Normalized Name")).toBeInTheDocument();
    });
  });

  test("shows error toast if parseResumeAction fails", async () => {
    mockedParseAction.mockResolvedValue({
      success: false,
      error: "Failed to parse resume.",
    });

    render(<CreatePortfolioClient />);
    expect(capturedOnFileUpload).toBeDefined();

    await act(async () => {
      if (capturedOnFileUpload) {
        capturedOnFileUpload(mockFile);
      }
    });

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith("Failed to parse resume.");
    });

    // Check UI remains on Dropzone
    expect(screen.getByTestId("dropzone-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("portfolio-editor-mock")).not.toBeInTheDocument();
  });

  test("returns to Dropzone when PortfolioEditor onCancel is called", async () => {
    mockedParseAction.mockResolvedValue({ success: true, data: dummyParsedData });
    render(<CreatePortfolioClient />);
    expect(capturedOnFileUpload).toBeDefined();

    await act(async () => {
      if (capturedOnFileUpload) {
        await capturedOnFileUpload(mockFile);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("portfolio-editor-mock")).toBeInTheDocument();
    });

    expect(capturedOnCancel).toBeDefined();
    await act(async () => {
      if (capturedOnCancel) {
        capturedOnCancel();
      }
    });

    expect(screen.getByTestId("dropzone-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("portfolio-editor-mock")).not.toBeInTheDocument();
  });
});
