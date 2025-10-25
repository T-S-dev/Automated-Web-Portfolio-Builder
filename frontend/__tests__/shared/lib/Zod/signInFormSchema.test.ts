import { signInSchema } from "@/shared/lib/Zod/signInFormSchema"; // Use absolute path

describe("signInSchema", () => {
  test("should validate correct email and password", () => {
    const result = signInSchema.safeParse({ identifier: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  test("should validate correct username (>= 4 chars) and password", () => {
    const result = signInSchema.safeParse({ identifier: "user1234", password: "password123" });
    expect(result.success).toBe(true);
  });

  test("should fail if identifier is missing or empty", () => {
    const result1 = signInSchema.safeParse({ password: "password123" });
    expect(result1.success).toBe(false);
    expect(result1.error?.issues[0].message).toBe("Invalid input: expected string, received undefined");

    const result2 = signInSchema.safeParse({ identifier: "", password: "password123" });
    expect(result2.success).toBe(false);
    expect(result2.error?.issues[0].message).toBe("Email/Username is required");
  });

  test("should fail if password is missing or empty", () => {
    const result1 = signInSchema.safeParse({ identifier: "test@example.com" });
    expect(result1.success).toBe(false);
    expect(result1.error?.issues[0].message).toBe("Invalid input: expected string, received undefined");

    const result2 = signInSchema.safeParse({ identifier: "test@example.com", password: "" });
    expect(result2.success).toBe(false);
    expect(result2.error?.issues[0].message).toBe("Password is required");
  });

  test("should fail if identifier is an invalid email format", () => {
    const result = signInSchema.safeParse({ identifier: "test@invalid", password: "password123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("Enter a valid email or username");
  });

  test("should fail if identifier is a username less than 4 chars", () => {
    const result = signInSchema.safeParse({ identifier: "usr", password: "password123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("Enter a valid email or username");
  });
});
