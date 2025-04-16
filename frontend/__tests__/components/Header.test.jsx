import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/components/Header";

let isUserSignedIn = false;

jest.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }) => (isUserSignedIn ? <>{children}</> : null),
  SignedOut: ({ children }) => (!isUserSignedIn ? <>{children}</> : null),
  SignInButton: () => <button>Sign In</button>,
  SignUpButton: () => <button>Sign Up</button>,
  UserButton: () => <button>User</button>,
}));

let mockPath = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPath,
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isUserSignedIn = false;
  });

  test("does not render header on portfolio, live-preview, or template routes", () => {
    const hiddenRoutes = ["/portfolio/john", "/live-preview", "/template/1"];
    hiddenRoutes.forEach((route) => {
      mockPath = route;
      render(<Header />);
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });
  });

  test("renders logo and Sign In/Sign Up buttons when signed out", () => {
    isUserSignedIn = false;
    mockPath = "/dashboard";
    render(<Header />);
    expect(screen.getByText("Automated Web Portfolio Builder")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("User")).not.toBeInTheDocument();
  });

  test("renders UserButton and not Sign In/Up when signed in", () => {
    isUserSignedIn = true;
    mockPath = "/dashboard";
    render(<Header />);
    expect(screen.getByText("Automated Web Portfolio Builder")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
  });
});
