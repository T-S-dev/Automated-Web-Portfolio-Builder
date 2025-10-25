import { normalizeParsedResume } from "@/shared/lib/normalizeResume"; // Use absolute path
import { ParsedResume, Portfolio } from "@/types"; // Import types

describe("normalizeParsedResume", () => {
  test("should return default Portfolio structure for empty/null input", () => {
    const nullParsed: ParsedResume = {
      // Object with null values
      personal: { name: null, job_title: null, email: null, phone: null, linkedin: null, github: null, location: null },
      professional_summary: null,
      education: null,
      experience: null,
      skills: null,
      projects: null,
      certifications: null,
    };

    const expectedOutput: Portfolio = {
      template: 1,
      personal: { name: "", job_title: "", email: "", phone: "", linkedin: "", github: "", location: "" },
      professional_summary: "",
      education: [],
      experience: [],
      skills: { technical: [], soft: [] },
      projects: [],
      certifications: [],
    };

    expect(normalizeParsedResume(nullParsed)).toEqual(expectedOutput);
  });

  test("should map all fields correctly when input is fully populated", () => {
    const fullParsed: ParsedResume = {
      personal: {
        name: "John Doe",
        job_title: "Software Engineer",
        email: "john.doe@email.com",
        phone: "123-456-7890",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        location: "City, Country",
      },
      professional_summary: "Experienced software engineer.",
      education: [
        { degree: "BSc CompSci", institution: "State University", grade: "A", start_date: "2010", end_date: "2014" },
      ],
      experience: [
        {
          job_title: "Dev",
          company: "Tech Corp",
          start_date: "2015",
          end_date: "Present",
          description: "Developed stuff.",
        },
      ],
      skills: {
        technical: ["React", "Node.js"],
        soft: ["Teamwork"],
      },
      projects: [
        {
          name: "Portfolio Builder",
          description: "Cool project.",
          technologies: ["Next.js"],
          url: "proj.com",
          repo: "git.com/proj",
        },
      ],
      certifications: [{ name: "Cloud Cert", issued_by: "Cloud Provider", date: "2023" }],
    };

    const expectedOutput: Portfolio = {
      template: 1,
      personal: {
        name: "John Doe",
        job_title: "Software Engineer",
        email: "john.doe@email.com",
        phone: "123-456-7890",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        location: "City, Country",
      },
      professional_summary: "Experienced software engineer.",
      education: [
        { degree: "BSc CompSci", institution: "State University", grade: "A", start_date: "2010", end_date: "2014" },
      ],
      experience: [
        {
          job_title: "Dev",
          company: "Tech Corp",
          start_date: "2015",
          end_date: "Present",
          description: "Developed stuff.",
        },
      ],
      skills: {
        technical: ["React", "Node.js"],
        soft: ["Teamwork"],
      },
      projects: [
        {
          name: "Portfolio Builder",
          description: "Cool project.",
          technologies: ["Next.js"],
          url: "proj.com",
          repo: "git.com/proj",
        },
      ],
      certifications: [{ name: "Cloud Cert", issued_by: "Cloud Provider", date: "2023" }],
    };

    expect(normalizeParsedResume(fullParsed)).toEqual(expectedOutput);
  });

  // --- Test Case 3: Partially Populated Input (Missing Nested Fields) ---
  test("should handle null fields within nested objects and arrays", () => {
    const partialParsedWithNulls: ParsedResume = {
      personal: {
        name: "Jane Doe",
        job_title: null,
        email: null,
        phone: null,
        linkedin: "linkedin.com/in/jane",
        github: null,
        location: "Another City",
      },
      professional_summary: null,
      education: [
        {
          institution: "Another University",
          degree: null,
          grade: null,
          start_date: null,
          end_date: "2018",
        },
      ],
      experience: [
        {
          company: "Startup Inc.",
          job_title: null,
          start_date: null,
          end_date: null,
          description: null,
        },
      ],
      skills: {
        technical: ["Python"],
        soft: null,
      },
      projects: [
        {
          name: "App",
          description: null,
          technologies: null,
          url: null,
          repo: null,
        },
      ],
      certifications: null,
    };

    const expectedOutput: Portfolio = {
      template: 1,
      personal: {
        name: "Jane Doe",
        job_title: "",
        email: "",
        phone: "",
        linkedin: "linkedin.com/in/jane",
        github: "",
        location: "Another City",
      },
      professional_summary: "",
      education: [{ degree: "", institution: "Another University", grade: "", start_date: "", end_date: "2018" }],
      experience: [{ job_title: "", company: "Startup Inc.", start_date: "", end_date: "", description: "" }],
      skills: {
        technical: ["Python"],
        soft: [],
      },
      projects: [{ name: "App", description: "", technologies: [], url: "", repo: "" }],
      certifications: [],
    };

    expect(normalizeParsedResume(partialParsedWithNulls)).toEqual(expectedOutput);
  });
});
