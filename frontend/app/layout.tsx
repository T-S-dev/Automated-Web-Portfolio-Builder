import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

export const metadata = {
  title: "Automated Web Portfolio Builder",
  description: "Generate a professional online portfolio from your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="flex min-h-screen flex-col">
          <Toaster
            position="bottom-right"
            richColors
            expand={true}
            duration={2000}
            visibleToasts={3}
            toastOptions={{
              classNames: {
                toast: "!border-none",
                error: "!bg-red-600 !text-white",
                success: "!bg-green-600 !text-white",
              },
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
