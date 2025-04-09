"use client";

import { User } from "lucide-react";

import SignUpForm from "@/components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-[500px] flex-col gap-y-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <User className="mx-auto h-8 w-8" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Automated Web Portfolio Builder</h1>
          <p className="text-muted-foreground">Sign up to continue</p>
        </div>

        <SignUpForm />

        <div className="text-center text-sm text-muted-foreground">
          <p>{new Date().getFullYear()} Automated Web Portfolio Builder.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
