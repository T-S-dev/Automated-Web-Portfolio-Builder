import { DefaultTemplate, TemplateMappings } from "@/features/template/lib/TemplateMappings";

// Mock Template 1
jest.mock("@/features/portfolio/components/public-view/Template1", () => {
  const MockTemplate1 = () => <div>Mock Template 1</div>;
  MockTemplate1.displayName = "MockTemplate1";
  return MockTemplate1;
});

// Mock Template 2
jest.mock("@/features/portfolio/components/public-view/Template2", () => {
  const MockTemplate2 = () => <div>Mock Template 2</div>;
  MockTemplate2.displayName = "MockTemplate2";
  return MockTemplate2;
});

const MockTemplate1 = jest.requireMock("@/features/portfolio/components/public-view/Template1");
const MockTemplate2 = jest.requireMock("@/features/portfolio/components/public-view/Template2");

describe("TemplateMappings", () => {
  test("should map template ID 1 to the Template1 component", () => {
    expect(TemplateMappings[1]).toBe(MockTemplate1);
  });

  test("should map template ID 2 to the Template2 component", () => {
    expect(TemplateMappings[2]).toBe(MockTemplate2);
  });

  test("should define DefaultTemplate as Template1", () => {
    expect(DefaultTemplate).toBe(MockTemplate1);
  });

  test("should return undefined for a non-existent template ID", () => {
    expect(TemplateMappings[999]).toBeUndefined();
  });
});
