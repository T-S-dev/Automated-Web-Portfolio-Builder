import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/shared/components/Header";

let isUserSignedIn = false;

jest.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (isUserSignedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (!isUserSignedIn ? <>{children}</> : null),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div data-testid="user-button-mock">UserButton Mock</div>,
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders logo and Sign In/Sign Up buttons when signed out", () => {
    isUserSignedIn = false;
    render(<Header />);

    const logoLink = screen.getByRole("link", { name: /Automated Web Portfolio Builder/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    expect(screen.queryByTestId("user-button-mock")).not.toBeInTheDocument();
  });

  test("renders logo with correct link and UserButton when signed in", () => {
    isUserSignedIn = true;
    render(<Header />);

    const logoLink = screen.getByRole("link", { name: /Automated Web Portfolio Builder/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");

    expect(screen.getByTestId("user-button-mock")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign Up" })).not.toBeInTheDocument();
  });
});
