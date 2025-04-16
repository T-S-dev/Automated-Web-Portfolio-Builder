import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PortfolioForm from "@/components/PortfolioForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import "@testing-library/jest-dom";
import { toast } from "sonner";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { username: "testuser" } }),
}));

jest.mock("axios");

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/PortfolioForm/TemplateList", () => () => <div data-testid="template-list" />);
jest.mock("@/components/PortfolioForm/PersonalSection", () => () => <div data-testid="personal-section" />);
jest.mock("@/components/PortfolioForm/ProfessionalSummarySection", () => () => <div data-testid="summary-section" />);
jest.mock("@/components/PortfolioForm/EducationSection", () => () => <div data-testid="education-section" />);
jest.mock("@/components/PortfolioForm/ExperienceSection", () => () => <div data-testid="experience-section" />);
jest.mock("@/components/PortfolioForm/SkillsSection", () => () => <div data-testid="skills-section" />);
jest.mock("@/components/PortfolioForm/ProjectsSection", () => () => <div data-testid="projects-section" />);
jest.mock("@/components/PortfolioForm/CertificationsSection", () => () => <div data-testid="certifications-section" />);

const mockPortfolio = {
  personal: { name: "John Doe", job_title: "Developer" },
  template: 1,
};

describe("PortfolioForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toast.loading.mockReturnValue("mock-toast-id");
  });

  test("renders initial visible sections", () => {
    render(<PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByTestId("template-list")).toBeInTheDocument();
    expect(screen.getByTestId("personal-section")).toBeInTheDocument();
    expect(screen.queryByTestId("summary-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("education-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("experience-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skills-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("projects-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("certifications-section")).not.toBeInTheDocument();
  });

  test("opens accordion sections and renders the components", async () => {
    render(<PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={jest.fn()} />);

    // At first, these sections should not be visible
    expect(screen.queryByTestId("summary-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("education-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("experience-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skills-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("projects-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("certifications-section")).not.toBeInTheDocument();

    // Click the accordion triggers (titles)
    fireEvent.click(screen.getByText("Professional Summary"));
    fireEvent.click(screen.getByText("Education"));
    fireEvent.click(screen.getByText("Experience"));
    fireEvent.click(screen.getByText("Skills"));
    fireEvent.click(screen.getByText("Projects"));
    fireEvent.click(screen.getByText("Certifications"));

    // components should now be visible
    expect(screen.getByTestId("summary-section")).toBeInTheDocument();
    expect(screen.getByTestId("education-section")).toBeInTheDocument();
    expect(screen.getByTestId("experience-section")).toBeInTheDocument();
    expect(screen.getByTestId("skills-section")).toBeInTheDocument();
    expect(screen.getByTestId("projects-section")).toBeInTheDocument();
    expect(screen.getByTestId("certifications-section")).toBeInTheDocument();
  });

  test("calls onCancel when 'Cancel' is clicked", () => {
    const cancelMock = jest.fn();
    render(<PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={cancelMock} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(cancelMock).toHaveBeenCalled();
  });

  test("submits form successfully in create mode", async () => {
    axios.post.mockResolvedValueOnce({});
    const openMock = jest.fn();
    window.open = openMock;

    render(<PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByText("Create Portfolio"));

    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Creating portfolio...");
      expect(axios.post).toHaveBeenCalledWith("/api/portfolio", expect.any(Object));
      expect(openMock).toHaveBeenCalledWith("/portfolio/testuser", "_blank");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(toast.success).toHaveBeenCalledWith("Portfolio created successfully!", { id: "mock-toast-id" });
    });
  });

  test("shows error toast on submission failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Failed"));
    render(<PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByText("Create Portfolio"));

    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Creating portfolio...");
      expect(axios.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Error saving portfolio.", { id: "mock-toast-id" });
    });
  });

  test("uses PUT in edit mode", async () => {
    axios.put.mockResolvedValueOnce({});
    render(
      <PortfolioForm portfolioData={mockPortfolio} setPortfolioData={jest.fn()} onCancel={jest.fn()} mode="edit" />,
    );
    fireEvent.click(screen.getByText("Update Portfolio"));

    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Updating portfolio...");
      expect(axios.put).toHaveBeenCalledWith("/api/portfolio", expect.any(Object));
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(toast.success).toHaveBeenCalledWith("Portfolio updated successfully!", { id: "mock-toast-id" });
    });
  });
});
