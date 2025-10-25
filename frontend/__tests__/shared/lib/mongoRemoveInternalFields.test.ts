import { removeInternalFields } from "@/shared/lib/mongoRemoveInternalFields";

describe("removeInternalFields", () => {
  test("should return primitive values unchanged", () => {
    expect(removeInternalFields("hello")).toBe("hello");
    expect(removeInternalFields(123)).toBe(123);
    expect(removeInternalFields(true)).toBe(true);
    expect(removeInternalFields(null)).toBeNull();
    expect(removeInternalFields(undefined)).toBeUndefined();
  });

  test("should return empty object/array unchanged", () => {
    expect(removeInternalFields({})).toEqual({});
    expect(removeInternalFields([])).toEqual([]);
  });

  test("should remove _id and __v from a simple object", () => {
    const input = { _id: "123", name: "Test", __v: 0, age: 30 };
    const expected = { name: "Test", age: 30 };
    expect(removeInternalFields(input)).toEqual(expected);
  });

  test("should keep objects without _id or __v unchanged", () => {
    const input = { name: "Test", age: 30, city: "City" };
    // Create a deep copy for comparison to ensure no mutation
    const expected = JSON.parse(JSON.stringify(input));
    expect(removeInternalFields(input)).toEqual(expected);
  });

  test("should remove _id and __v recursively from nested objects", () => {
    const input = {
      _id: "top123",
      name: "Top",
      __v: 1,
      nested: {
        _id: "nested456",
        value: "NestedValue",
        __v: 0,
        deep: {
          keep: true,
          _id: "deep789",
        },
      },
      other: "field",
    };
    const expected = {
      name: "Top",
      nested: {
        value: "NestedValue",
        deep: {
          keep: true,
        },
      },
      other: "field",
    };
    expect(removeInternalFields(input)).toEqual(expected);
  });

  test("should remove _id and __v from objects within an array", () => {
    const input = [
      { _id: "a1", name: "A", __v: 0 },
      { name: "B", value: "Keep" },
      { _id: "c3", name: "C", age: 10, __v: 2 },
    ];
    const expected = [{ name: "A" }, { name: "B", value: "Keep" }, { name: "C", age: 10 }];
    expect(removeInternalFields(input)).toEqual(expected);
  });

  test("should handle arrays containing mixed types including nested objects", () => {
    const input = [
      { _id: "a1", data: { value: "A", __v: 0 } },
      "string",
      123,
      null,
      [{ _id: "nestedArray1", x: 1 }],
      { name: "B", nestedObj: { _id: "bId", keep: "yes" } },
    ];
    const expected = [
      { data: { value: "A" } },
      "string",
      123,
      null,
      [{ x: 1 }],
      { name: "B", nestedObj: { keep: "yes" } },
    ];
    expect(removeInternalFields(input)).toEqual(expected);
  });

  test("should handle objects containing arrays of objects", () => {
    const input = {
      _id: "objId",
      items: [{ _id: "item1", value: "One", __v: 0 }, { name: "Two" }],
      details: {
        __v: 1,
        codes: [
          { _id: "codeA", code: "A" },
          { _id: "codeB", code: "B" },
        ],
      },
    };
    const expected = {
      items: [{ value: "One" }, { name: "Two" }],
      details: {
        codes: [{ code: "A" }, { code: "B" }],
      },
    };
    expect(removeInternalFields(input)).toEqual(expected);
  });
});
