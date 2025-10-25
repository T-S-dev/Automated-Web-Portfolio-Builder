import { signUpSchema } from "@/shared/lib/Zod/signUpFormSchema";

describe("signUpSchema", () => {
  const validData = {
    firstName: " John ",
    lastName: " Doe ",
    username: " johndoe123 ",
    emailAddress: "test@example.com",
    password: "Password123!",
  };

  test("should validate correct data", () => {
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      // Check trims
      expect(result.data.firstName).toBe("John");
      expect(result.data.lastName).toBe("Doe");
      expect(result.data.username).toBe("johndoe123");
      expect(result.data.emailAddress).toBe("test@example.com");
      expect(result.data.password).toBe("Password123!");
    }
  });

  test("should fail if required fields are missing or empty", () => {
    expect(signUpSchema.safeParse({ ...validData, firstName: "" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validData, lastName: " " }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validData, username: "" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validData, emailAddress: "" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validData, password: "" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validData, firstName: "" }).error?.issues[0].message).toBe(
      "First Name is required",
    );
    expect(signUpSchema.safeParse({ ...validData, emailAddress: "" }).error?.issues[0].message).toBe(
      "Email is required/invalid",
    );
  });

  test("should fail if username is too short or too long", () => {
    const shortUsername = signUpSchema.safeParse({ ...validData, username: "usr" });
    expect(shortUsername.success).toBe(false);
    expect(shortUsername.error?.issues[0].message).toBe("Username must be at least 4 characters");

    const longUsername = signUpSchema.safeParse({ ...validData, username: "a".repeat(65) });
    expect(longUsername.success).toBe(false);
    expect(longUsername.error?.issues[0].message).toBe("Username must be at most 64 characters");
  });

  test("should fail if email is invalid", () => {
    const result = signUpSchema.safeParse({ ...validData, emailAddress: "invalid-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email is required/invalid");
  });

  test("should fail if password is too short", () => {
    const result = signUpSchema.safeParse({ ...validData, password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Password must be at least 8 characters");
  });
});
