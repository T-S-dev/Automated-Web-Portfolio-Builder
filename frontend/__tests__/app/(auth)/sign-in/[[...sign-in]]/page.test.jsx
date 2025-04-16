import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignInPageWrapper from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/components/auth/SignInPage", () => () => <div>Sign In Page Mock</div>);

describe("SignInPageWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to /dashboard if already signed in", async () => {
    auth.mockResolvedValueOnce({ userId: "abc123" });

    await SignInPageWrapper();

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  test("renders SignInPage if not authenticated", async () => {
    auth.mockResolvedValueOnce({ userId: null });

    render(await SignInPageWrapper());

    expect(screen.getByText("Sign In Page Mock")).toBeInTheDocument();
  });
});
