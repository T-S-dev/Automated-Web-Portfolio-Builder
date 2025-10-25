import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import PortfolioForm from "@/features/portfolio/components/PortfolioForm";
import { createOrUpdatePortfolioAction } from "@/features/portfolio/actions";

import { Portfolio } from "@/types";

const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: mockRouterPush })),
}));

const mockUseUser = useUser as jest.Mock;
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/features/portfolio/actions", () => ({
  createOrUpdatePortfolioAction: jest.fn(),
}));

const mockWindowOpen = jest.fn();
global.open = mockWindowOpen;

jest.mock("@/features/portfolio/components/PortfolioForm/TemplateList", () => () => (
  <div data-testid="template-list" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/PersonalSection", () => () => (
  <div data-testid="personal-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/ProfessionalSummarySection", () => () => (
  <div data-testid="summary-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/EducationSection", () => () => (
  <div data-testid="education-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/ExperienceSection", () => () => (
  <div data-testid="experience-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/SkillsSection", () => () => (
  <div data-testid="skills-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/ProjectsSection", () => () => (
  <div data-testid="projects-section" />
));
jest.mock("@/features/portfolio/components/PortfolioForm/CertificationsSection", () => () => (
  <div data-testid="certifications-section" />
));

const mockedCreateOrUpdateAction = createOrUpdatePortfolioAction as jest.Mock;
const mockedToastSuccess = toast.success as jest.Mock;
const mockedToastError = toast.error as jest.Mock;

const renderWithFormProvider = (
  ui: React.ReactElement,
  { defaultValues = {} }: { defaultValues?: Partial<Portfolio> } = {},
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm<Portfolio>({ defaultValues: defaultValues as Portfolio });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  return {
    ...render(ui, { wrapper: Wrapper }),
  };
};

describe("PortfolioForm", () => {
  const mockPortfolio: Portfolio = {
    template: 1,
    personal: {
      name: "John Doe",
      job_title: "Dev",
      email: "a@b.com",
      phone: null,
      linkedin: null,
      github: null,
      location: null,
    },
    professional_summary: "Summary",
    education: [],
    experience: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };

  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { username: "testuser" } });
  });

  test("renders initial visible sections", () => {
    renderWithFormProvider(<PortfolioForm onCancel={mockOnCancel} mode="create" />, { defaultValues: mockPortfolio });
    expect(screen.getByTestId("template-list")).toBeInTheDocument();
    expect(screen.getByTestId("personal-section")).toBeInTheDocument();

    expect(screen.queryByTestId("summary-section")).not.toBeInTheDocument();
  });

  test("opens accordion sections and renders the components", () => {
    renderWithFormProvider(<PortfolioForm onCancel={jest.fn()} mode="create" />, { defaultValues: mockPortfolio });

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
    renderWithFormProvider(<PortfolioForm onCancel={mockOnCancel} mode="create" />, { defaultValues: mockPortfolio });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("submits successfully in create mode, opens new tab, and navigates", async () => {
    mockedCreateOrUpdateAction.mockResolvedValue({ success: true });

    renderWithFormProvider(<PortfolioForm onCancel={mockOnCancel} mode="create" />, { defaultValues: mockPortfolio });

    fireEvent.click(screen.getByRole("button", { name: "Create Portfolio" }));

    await waitFor(() => {
      expect(mockedCreateOrUpdateAction).toHaveBeenCalledWith(mockPortfolio);
      expect(mockedToastSuccess).toHaveBeenCalledWith("Portfolio created successfully!");
      expect(mockWindowOpen).toHaveBeenCalledWith("/portfolio/testuser", "_blank");
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("submits successfully in edit mode and calls reset", async () => {
    mockedCreateOrUpdateAction.mockResolvedValue({ success: true });

    // Need to spy on reset *within* the context for this specific test
    const mockReset = jest.fn();
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const methods = useForm<Portfolio>({ defaultValues: mockPortfolio });
      methods.reset = mockReset;
      return <FormProvider {...methods}>{children}</FormProvider>;
    };

    render(<PortfolioForm onCancel={mockOnCancel} mode="edit" />, { wrapper: Wrapper });

    // Define the data expected by handleSubmit (which is the current form state)
    const expectedSubmitData = mockPortfolio;

    fireEvent.click(screen.getByRole("button", { name: "Update Portfolio" }));

    await waitFor(() => {
      expect(mockedCreateOrUpdateAction).toHaveBeenCalledWith(expectedSubmitData);
      expect(mockedToastSuccess).toHaveBeenCalledWith("Portfolio updated successfully!");
      expect(mockReset).toHaveBeenCalledWith(expectedSubmitData);
    });

    expect(mockWindowOpen).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test("shows error toast on submission failure", async () => {
    const errorMessage = "Database error during save.";
    mockedCreateOrUpdateAction.mockResolvedValue({ success: false, error: errorMessage });

    renderWithFormProvider(<PortfolioForm onCancel={mockOnCancel} mode="create" />, { defaultValues: mockPortfolio });

    fireEvent.click(screen.getByRole("button", { name: "Create Portfolio" }));

    await waitFor(() => {
      expect(mockedCreateOrUpdateAction).toHaveBeenCalled();
      expect(mockedToastError).toHaveBeenCalledWith(errorMessage);
    });

    expect(mockedToastSuccess).not.toHaveBeenCalled();
    expect(mockWindowOpen).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
