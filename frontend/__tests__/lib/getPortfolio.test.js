import getPortfolio from "@/lib/getPortfolio";
import { mongooseConnect } from "@/lib/mongoose";
import Portfolio from "@/models/Portfolio";

jest.mock("@/lib/mongoose", () => ({
  mongooseConnect: jest.fn(),
}));

jest.mock("@/models/Portfolio", () => ({
  findOne: jest.fn(),
}));

describe("getPortfolio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null if portfolio not found", async () => {
    Portfolio.findOne.mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    const result = await getPortfolio("nonexistentuser");
    expect(result).toBeNull();
    expect(mongooseConnect).toHaveBeenCalled();
  });

  test("returns cleaned portfolio without _id fields", async () => {
    const mockData = {
      personal: { name: "John Doe", _id: "a" },
      skills: { technical: ["JS"], _id: "b" },
      education: [{ degree: "BSc Computer Science", _id: "c" }],
      experience: [{ job_title: "Frontend Developer", _id: "d" }],
      projects: [{ name: "Portfolio Builder", _id: "e" }],
      certifications: [{ name: "Certified React Developer", _id: "f" }],
    };

    Portfolio.findOne.mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(mockData),
      }),
    });

    const result = await getPortfolio("john123");

    expect(result).toEqual({
      personal: { name: "John Doe" },
      skills: { technical: ["JS"] },
      education: [{ degree: "BSc Computer Science" }],
      experience: [{ job_title: "Frontend Developer" }],
      projects: [{ name: "Portfolio Builder" }],
      certifications: [{ name: "Certified React Developer" }],
    });

    expect(mongooseConnect).toHaveBeenCalled();
  });
});
