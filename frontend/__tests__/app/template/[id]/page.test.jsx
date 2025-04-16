import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TemplatePage from "@/app/template/[id]/page";
import { notFound } from "next/navigation";

jest.mock("@/lib/TemplateMappings", () => ({
  TemplateMappings: {
    1: ({ portfolio }) => <div>Template 1 - {portfolio.personal.name}</div>,
    2: ({ portfolio }) => <div>Template 2 - {portfolio.personal.name}</div>,
  },
}));

jest.mock("@/lib/ExamplePortfolio", () => ({
  personal: { name: "John Doe" },
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

describe("TemplatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Template 1 when id is 1", async () => {
    const page = await TemplatePage({ params: { id: "1" } });
    render(page);
    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
  });

  test("renders Template 2 when id is 2", async () => {
    const page = await TemplatePage({ params: { id: "2" } });
    render(page);
    expect(screen.getByText("Template 2 - John Doe")).toBeInTheDocument();
  });

  test("calls notFound for unknown template id", async () => {
    await TemplatePage({ params: { id: "99" } });
    expect(notFound).toHaveBeenCalled();
  });
});
