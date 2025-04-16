import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardClient from "@/app/dashboard/DashboardClient";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

jest.mock("axios");
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

describe("DashboardClient", () => {
  const mockPortfolio = {
    personal: {
      name: "John Doe",
    },
    is_private: true,
    username: "john123",
  };

  beforeEach(() => {
    useUser.mockReturnValue({ user: { username: "john123" } });
  });

  test("renders portfolio data and key buttons", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);

    expect(screen.getByText("John Doe's Portfolio")).toBeInTheDocument();
    expect(screen.getByText("View Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Edit Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Delete Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Make Public")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  test("view portfolio link directs to the correct URL", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);
    const viewLink = screen.getByRole("link", { name: "View Portfolio" });
    expect(viewLink).toHaveAttribute("href", `/portfolio/john123`);
  });

  test("edit portfolio link directs to the correct URL", () => {
    render(<DashboardClient portfolio={mockPortfolio} />);
    const editLink = screen.getByRole("link", { name: "Edit Portfolio" });
    expect(editLink).toHaveAttribute("href", `/dashboard/edit`);
  });

  test("delete portfolio opens confirm modal and triggers delete", async () => {
    axios.delete.mockResolvedValueOnce({});

    render(<DashboardClient portfolio={mockPortfolio} />);

    fireEvent.click(screen.getByText("Delete Portfolio"));

    const confirmButton = await screen.findByText("Yes, Delete Portfolio");
    expect(confirmButton).toBeInTheDocument();
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/portfolio");
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  test("toggle privacy calls axios.put and toggles state", async () => {
    axios.put.mockResolvedValueOnce({});
    render(<DashboardClient portfolio={mockPortfolio} />);

    const toggleButton = screen.getByRole("button", { name: "Make Public" });

    fireEvent.click(toggleButton);

    expect(axios.put).toHaveBeenCalledWith("/api/portfolio", { is_private: false });

    await waitFor(() => {
      expect(screen.getByText("Make Private")).toBeInTheDocument();
    });
  });

  test("privacy button is disabled during toggle", async () => {
    axios.put.mockImplementationOnce(() => new Promise(() => {}));
    render(<DashboardClient portfolio={mockPortfolio} />);

    const toggleButton = screen.getByRole("button", { name: "Make Public" });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toBeDisabled();
    });
  });

  test("copy to clipboard calls navigator.clipboard.writeText", async () => {
    const writeTextMock = jest.fn();
    navigator.clipboard = { writeText: writeTextMock };

    render(<DashboardClient portfolio={mockPortfolio} />);
    fireEvent.click(screen.getByText("Copy Link"));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/portfolio/john123`);
    });
  });
});
