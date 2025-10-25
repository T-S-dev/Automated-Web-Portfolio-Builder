import { cn, handleSelectKeyDown, getInitials, formatUrl } from "@/shared/lib/utils";

describe("utils.js", () => {
  describe("cn", () => {
    test("merges class names with tailwind-merge and clsx", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");
      expect(cn("text-sm", false && "hidden")).toBe("text-sm");
      expect(cn("mt-2", null, "mb-4")).toBe("mt-2 mb-4");
    });
  });

  describe("handleSelectKeyDown", () => {
    test("prevents default when backspace is pressed and input is empty", () => {
      const preventDefault = jest.fn();
      const event = {
        key: "Backspace",
        target: { value: "" },
        preventDefault,
      };

      handleSelectKeyDown(event);
      expect(preventDefault).toHaveBeenCalled();
    });

    test("does not prevent default when key is not backspace", () => {
      const preventDefault = jest.fn();
      const event = {
        key: "Enter",
        target: { value: "" },
        preventDefault,
      };

      handleSelectKeyDown(event);
      expect(preventDefault).not.toHaveBeenCalled();
    });

    test("does not prevent default when input is not empty", () => {
      const preventDefault = jest.fn();
      const event = {
        key: "Backspace",
        target: { value: "text" },
        preventDefault,
      };

      handleSelectKeyDown(event);
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("getInitials", () => {
    test("returns initials of the name", () => {
      expect(getInitials("Alice")).toBe("A");
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials(" John Doe ")).toBe("JD");
      expect(getInitials("AY BY CY")).toBe("ABC");
      expect(getInitials("AY BY CY DY")).toBe("ABC");
    });

    test("returns N/A for empty input", () => {
      expect(getInitials("")).toBe("N/A");
      expect(getInitials(null)).toBe("N/A");
    });
  });

  describe("formatUrl", () => {
    test("returns empty string for blank input", () => {
      expect(formatUrl("")).toBe("");
      expect(formatUrl("   ")).toBe("");
      expect(formatUrl(null)).toBe("");
    });

    test("prepends https:// if missing", () => {
      expect(formatUrl("example.com")).toBe("https://example.com");
    });

    test("keeps existing http/https", () => {
      expect(formatUrl("http://example.com")).toBe("http://example.com");
      expect(formatUrl("https://example.com")).toBe("https://example.com");
    });
  });
});
