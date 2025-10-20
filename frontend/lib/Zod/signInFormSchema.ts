import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .nonempty("Email/Username is required")
    .refine(
      (val) => {
        if (val.includes("@")) {
          return z.email().safeParse(val).success;
        }
        return val.length >= 4;
      },
      { message: "Enter a valid email or username (min 4 characters)" },
    ),
  password: z.string().nonempty("Password is required"),
});

export type SignInForm = z.infer<typeof signInSchema>;
