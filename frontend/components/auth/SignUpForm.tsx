"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { signUpSchema, type SignUpForm as SignUpFormType } from "@/lib/Zod/signUpFormSchema";

const SignUpForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [verify, setVerify] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormType) => {
    if (!isLoaded) return;

    try {
      setCreatingAccount(true);
      await signUp.create(data);

      // send verification code to user's email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerify(true);
    } catch (error) {
      setCreatingAccount(false);
      if (isClerkAPIResponseError(error)) {
        error.errors.forEach((error) => {
          setError(error.meta?.paramName as keyof SignUpFormType, { type: "manual", message: error.message });
        });
      } else {
        toast.error("An unexpected error occurred during sign up.");
      }
    } finally {
      setCreatingAccount(false);
    }
  };

  // Verify User Email Code
  const onPressVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    setVerifying(true);
    setVerificationError("");

    if (!verificationCode) {
      setVerificationError("Please enter the verification code.");
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError("Please enter a valid verification code.");
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      if (completeSignUp.status !== "complete") {
        toast.error("Sign up failed. Please try again.");
      }
      if (completeSignUp.status === "complete") {
        setVerificationError("");
        toast.success("Sign up successful.");
        await setActive({ session: completeSignUp.createdSessionId });
        router.push(`/dashboard`);
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        setVerificationError(error.errors[0]?.longMessage || "Verification failed. Please try again.");
      } else {
        setVerificationError("An unexpected error occurred.");
      }
    } finally {
      setVerifying(false);
    }
  };

  if (verify) {
    return (
      <form onSubmit={onPressVerify} className="flex flex-col items-center space-y-4 md:space-y-6">
        <input
          value={verificationCode}
          placeholder="Enter Verification Code..."
          maxLength={6}
          onChange={(e) => setVerificationCode(e.target.value)}
          aria-label="Verification Code Input"
        />

        {verificationError && <div className="!mt-2 ml-1 text-sm font-medium text-red-500">{verificationError}</div>}
        <Button
          variant="outline"
          type="submit"
          className="w-full bg-blue-500 text-white hover:bg-blue-600"
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify"}
        </Button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-12">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="firstName" className="text-primary block text-sm font-medium">
              First Name
            </label>
            <input id="firstName" {...register("firstName")} type="text" placeholder="First Name" />
            {errors.firstName && <p className="ml-1 text-sm text-red-500">{errors.firstName.message}</p>}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="lastName" className="text-primary block text-sm font-medium">
              Last Name
            </label>
            <input id="lastName" {...register("lastName")} type="text" placeholder="Last Name" />
            {errors.lastName && <p className="ml-1 text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-primary block text-sm font-medium">
            Username
          </label>
          <input id="username" {...register("username")} type="text" placeholder="Username" />
          {errors.username && <p className="ml-1 text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-primary block text-sm font-medium">
            Email Address
          </label>
          <input id="email" {...register("emailAddress")} type="email" placeholder="name@example.com" />
          {errors.emailAddress && <p className="ml-1 text-sm text-red-500">{errors.emailAddress.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-primary block text-sm font-medium">
            Password
          </label>
          <input id="password" {...register("password")} type="password" placeholder="••••••••" />
          {errors.password && <p className="ml-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button
          variant="outline"
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={creatingAccount}
        >
          {creatingAccount ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <p className="text-primary text-center">
        Already have an account? &nbsp;
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUpForm;
