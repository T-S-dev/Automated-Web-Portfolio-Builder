import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import SignInPage from "@/components/auth/SignInPage";

export default async function SignInPageWrapper() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return <SignInPage />;
}
