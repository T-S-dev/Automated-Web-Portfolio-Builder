"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const Header = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/portfolio") || pathname.startsWith("/live-preview") || pathname.startsWith("/template")) {
    return null;
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-800 p-6">
      <Link href="/" className="flex items-center space-x-2">
        <h1 className="text-xl font-bold hover:scale-[101%]">Automated Web Portfolio Builder</h1>
      </Link>

      <div className="flex space-x-2">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <div className="flex space-x-2">
            <SignInButton forceRedirectUrl="/dashboard">
              <button className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton forceRedirectUrl="/dashboard">
              <button className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
