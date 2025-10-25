import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { notFound } from "next/navigation";

import TemplatePage from "@/app/(portfolio)/template/[id]/page";

import { Portfolio } from "@/types";

jest.mock("@/features/template/lib/TemplateMappings", () => ({
  TemplateMappings: {
    1: jest.fn(({ portfolio }: { portfolio: Portfolio }) => <div>Template 1 - {portfolio.personal.name}</div>),
    2: jest.fn(({ portfolio }: { portfolio: Portfolio }) => <div>Template 2 - {portfolio.personal.name}</div>),
  },
}));

jest.mock("@/shared/constants/ExamplePortfolio", () => ({
  personal: { name: "John Doe" },
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

const createProps = (id: string) => ({
  params: Promise.resolve({ id }),
});

describe("TemplatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Template 1 when id is 1", async () => {
    const props = createProps("1");
    const Page = await TemplatePage(props);
    render(Page);

    expect(screen.getByText("Template 1 - John Doe")).toBeInTheDocument();
  });

  test("renders Template 2 when id is 2", async () => {
    const props = createProps("2");
    const Page = await TemplatePage(props);
    render(Page);

    expect(screen.getByText("Template 2 - John Doe")).toBeInTheDocument();
  });

  test("calls notFound for unknown template id", async () => {
    const props = createProps("99");
    await TemplatePage(props);

    expect(notFound).toHaveBeenCalled();
  });

  test("calls notFound for a non-numeric id (isNaN)", async () => {
    const props = createProps("abc");
    await TemplatePage(props);

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
