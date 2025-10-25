import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm, FormProvider } from "react-hook-form";

import PortfolioEditor from "@/features/portfolio/components/PortfolioEditor";

import { Portfolio } from "@/types";

let watchCallback: (values: any) => void = () => {};
const mockWatch = jest.fn((callback) => {
  watchCallback = callback; // Capture the callback
  // Return a dummy unsubscribe function
  return { unsubscribe: jest.fn() };
});

const mockSetValue = jest.fn();
const mockGetValues = jest.fn(); // Mock getValues to return initial data
jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"), // Use actual FormProvider etc.
  useForm: jest.fn(() => ({
    // Mock the hook itself
    watch: mockWatch,
    handleSubmit: jest.fn((fn) => fn),
    reset: jest.fn(),
    setValue: mockSetValue,
    getValues: mockGetValues,
    formState: { errors: {} },
  })),
  useFormContext: jest.fn(() => ({
    watch: mockWatch,
    handleSubmit: jest.fn((fn) => fn),
    reset: jest.fn(),
    setValue: mockSetValue,
    getValues: mockGetValues,
    formState: { errors: {} },
    register: jest.fn(),
    control: {},
  })),
}));

jest.mock("@/features/portfolio/components/PortfolioForm", () => {
  return jest.fn(({ mode, onCancel }: { mode: string; onCancel: () => void }) => (
    <div data-testid="portfolio-form-mock">
      PortfolioForm Mock - {mode}
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ));
});
const MockedPortfolioForm = jest.requireMock("@/features/portfolio/components/PortfolioForm") as jest.Mock;

describe("PortfolioEditor", () => {
  const mockInitialPortfolio: Portfolio = {
    template: 1,
    personal: { name: "John Doe", job_title: "", email: "", phone: "", linkedin: "", github: "", location: "" },
    professional_summary: "",
    education: [],
    experience: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };

  const mockCancel = jest.fn();
  const mockPostMessage = jest.fn();

  const originalWindowAddEventListener = window.addEventListener;
  const originalWindowRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    jest.clearAllMocks();
    watchCallback = () => {}; // Reset captured callback
    // Set default return value for getValues used by useForm mock
    mockGetValues.mockReturnValue(mockInitialPortfolio);
    // Reset window listeners
    window.addEventListener = originalWindowAddEventListener;
    window.removeEventListener = originalWindowRemoveEventListener;

    // Ensure useForm mock is reset if needed, though jest.clearAllMocks usually handles it
    (useForm as jest.Mock).mockImplementation(() => ({
      watch: mockWatch,
      handleSubmit: jest.fn((fn) => fn),
      reset: jest.fn(),
      setValue: mockSetValue,
      getValues: mockGetValues, // Ensure getValues returns the latest
      formState: { errors: {} },
    }));
    // Mock useFormContext as well, returning consistent mocked methods
    (jest.requireMock("react-hook-form").useFormContext as jest.Mock).mockImplementation(() => ({
      watch: mockWatch,
      handleSubmit: jest.fn((fn) => fn),
      reset: jest.fn(),
      setValue: mockSetValue,
      getValues: mockGetValues,
      formState: { errors: {} },
    }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("renders PortfolioForm with correct mode and onCancel props", () => {
    render(<PortfolioEditor portfolio={mockInitialPortfolio} mode="edit" onCancel={mockCancel} />);

    expect(screen.getByTestId("portfolio-form-mock")).toBeInTheDocument();
    expect(screen.getByText("PortfolioForm Mock - edit")).toBeInTheDocument();

    expect(MockedPortfolioForm).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "edit",
        onCancel: mockCancel,
      }),
      undefined,
    );
  });

  test("renders iframe with correct live preview src", () => {
    render(<PortfolioEditor portfolio={mockInitialPortfolio} mode="edit" onCancel={mockCancel} />);
    const iframe = screen.getByTitle<HTMLIFrameElement>("Live Preview"); // Type assertion

    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toEqual(expect.stringContaining("/live-preview"));
  });

  test("sends initial portfolio data via postMessage after iframe is ready", async () => {
    render(<PortfolioEditor portfolio={mockInitialPortfolio} mode="edit" onCancel={mockCancel} />);
    const iframe = screen.getByTitle<HTMLIFrameElement>("Live Preview");

    Object.defineProperty(iframe, "contentWindow", {
      value: { postMessage: mockPostMessage },
      writable: true,
    });

    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data: { status: "ready" } }));
    });

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith(
        { portfolioData: mockInitialPortfolio },
        expect.stringContaining("/live-preview"),
      );
    });
  });

  test("sends updated portfolio data via postMessage when form data changes (via watch)", async () => {
    render(<PortfolioEditor portfolio={mockInitialPortfolio} mode="edit" onCancel={mockCancel} />);
    const iframe = screen.getByTitle<HTMLIFrameElement>("Live Preview");
    Object.defineProperty(iframe, "contentWindow", { value: { postMessage: mockPostMessage }, writable: true });

    // 1. Simulate iframe ready and initial postMessage
    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data: { status: "ready" } }));
    });
    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenLastCalledWith(
        { portfolioData: mockInitialPortfolio },
        expect.stringContaining("/live-preview"),
      );
    });

    // 2. Define updated data
    const updatedPortfolio = {
      ...mockInitialPortfolio,
      personal: { ...mockInitialPortfolio.personal, name: "Jane Doe Updated" },
    };

    // 3. Simulate the watch callback firing with updated data
    act(() => {
      watchCallback(updatedPortfolio); // Manually trigger the captured callback
    });

    // 4. Wait for the useEffect hook listening to watchedData to send a *new* message
    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledTimes(2); // Second message
      expect(mockPostMessage).toHaveBeenLastCalledWith(
        { portfolioData: updatedPortfolio }, // Check it sends the *updated* data
        expect.stringContaining("/live-preview"),
      );
    });
  });

  test("removes message event listener on unmount", () => {
    // Spy on the actual window methods
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<PortfolioEditor portfolio={mockInitialPortfolio} mode="edit" onCancel={mockCancel} />);

    // Find the specific handler function that was added for 'message'
    const messageHandler = addSpy.mock.calls.find((call) => call[0] === "message")?.[1];
    expect(messageHandler).toBeDefined(); // Ensure listener was added

    // Unmount the component
    unmount();

    // Assert removeEventListener was called with the exact same handler
    expect(removeSpy).toHaveBeenCalledWith("message", messageHandler);
  });
});
