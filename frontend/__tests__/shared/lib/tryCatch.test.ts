import { tryCatch } from "@/shared/lib/tryCatch";

describe("tryCatch", () => {
  test("should return [data, null] when the promise resolves", async () => {
    const mockData = { id: 1, name: "Success" };
    const resolvingPromise = Promise.resolve(mockData);

    const result = await tryCatch(resolvingPromise);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockData);
    expect(result[1]).toBeNull();
  });

  test("should return [null, error] when the promise rejects", async () => {
    const mockError = new Error("Something went wrong!");
    const rejectingPromise = Promise.reject(mockError);

    const result = await tryCatch(rejectingPromise);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeNull();
    expect(result[1]).toBe(mockError);
    expect(result[1]).toBeInstanceOf(Error);
    expect((result[1] as Error).message).toBe("Something went wrong!");
  });

  test("should correctly type the error when specified", async () => {
    class CustomError extends Error {
      code: number;
      constructor(message: string, code: number) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, CustomError.prototype);
      }
    }
    const mockCustomError = new CustomError("Specific error", 123);
    const rejectingPromise = Promise.reject(mockCustomError);

    const result = await tryCatch<unknown, CustomError>(rejectingPromise);

    expect(result[0]).toBeNull();
    expect(result[1]).toBeInstanceOf(CustomError);
    expect((result[1] as CustomError).message).toBe("Specific error");
    expect((result[1] as CustomError).code).toBe(123);
  });
});
