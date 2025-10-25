import {
  PersonalSchema,
  EducationSchema,
  ExperienceSchema,
  SkillsSchema,
  ProjectSchema,
  CertificationSchema,
  PortfolioSchema,
  Portfolio,
} from "@/shared/lib/Zod/portfolioSchema";

jest.mock("@/shared/lib/utils", () => ({
  ...jest.requireActual("@/shared/lib/utils"),
  formatUrl: jest.fn((v) => (v && !v.startsWith("http") ? `https://${v}` : v)),
}));

describe("Portfolio Zod Schemas", () => {
  describe("PersonalSchema", () => {
    const validData = {
      name: " John Doe ",
      job_title: " Dev ",
      email: "test@test.com",
      phone: " 123-456-7890 ",
      linkedin: "linkedin.com/in/johndoe",
      github: " github.com/johndoe ",
      location: " City ",
    };

    const emptyOptionalData = {
      name: "Opt",
      job_title: "Test",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      location: "",
    };

    test("should validate correct data", () => {
      const result = PersonalSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.job_title).toBe("Dev");
        expect(result.data.email).toBe("test@test.com");
        expect(result.data.phone).toBe("123-456-7890");
        expect(result.data.linkedin).toBe("https://linkedin.com/in/johndoe");
        expect(result.data.github).toBe("https://github.com/johndoe");
        expect(result.data.location).toBe("City");
      }
    });

    test("should transform empty strings to null for optional fields", () => {
      const result = PersonalSchema.safeParse(emptyOptionalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Opt");
        expect(result.data.job_title).toBe("Test");
        expect(result.data.email).toBeNull();
        expect(result.data.phone).toBeNull();
        expect(result.data.linkedin).toBeNull();
        expect(result.data.github).toBeNull();
        expect(result.data.location).toBeNull();
      }
    });

    test("should fail if required fields are missing/empty", () => {
      expect(PersonalSchema.safeParse({ job_title: "Job" }).success).toBe(false);
      expect(PersonalSchema.safeParse({ name: "Name" }).success).toBe(false);
      expect(PersonalSchema.safeParse({ name: " ", job_title: " " }).success).toBe(false);
    });

    test("should fail on invalid email", () => {
      const result = PersonalSchema.safeParse({ ...emptyOptionalData, email: "invalid-email" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Invalid email");
    });

    test("should fail on invalid phone format", () => {
      const result = PersonalSchema.safeParse({ ...emptyOptionalData, phone: "123" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Invalid phone number format");
    });

    test("should fail on invalid linkedin URL", () => {
      const result = PersonalSchema.safeParse({ ...emptyOptionalData, linkedin: "invalid-linkedin-url" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Invalid LinkedIn profile URL");
    });

    test("should fail on invalid github URL", () => {
      const result = PersonalSchema.safeParse({ ...emptyOptionalData, github: "gihu.com/invalid/" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Invalid GitHub profile URL");
    });
  });

  describe("EducationSchema", () => {
    // Similar structure: valid, minimal, empty optional, missing required
    const validData = { degree: " BSc ", institution: " Uni ", grade: " A ", start_date: " 2010 ", end_date: " 2014 " };
    const minimalData = { degree: "MinDeg", start_date: "Start", end_date: "End" };
    const emptyOptionalData = { ...minimalData, institution: "", grade: "" };

    test("should validate correct data", () => {
      const result = EducationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.degree).toBe("BSc");
        expect(result.data.institution).toBe("Uni");
        expect(result.data.grade).toBe("A");
        expect(result.data.start_date).toBe("2010");
        expect(result.data.end_date).toBe("2014");
      }
    });
    test("should transform empty optionals to null", () => {
      const result = EducationSchema.safeParse(emptyOptionalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.institution).toBeNull();
        expect(result.data.grade).toBeNull();
      }
    });
    test("should fail if required fields are missing/empty", () => {
      expect(EducationSchema.safeParse({ start_date: "S", end_date: "E" }).success).toBe(false);
      expect(EducationSchema.safeParse({ degree: "D", end_date: "E" }).success).toBe(false);
      expect(EducationSchema.safeParse({ degree: "D", start_date: "S" }).success).toBe(false);
    });
  });

  describe("ExperienceSchema", () => {
    const validData = {
      job_title: "Dev",
      company: "Corp",
      start_date: "S",
      end_date: "E",
      description: "<p>Desc <strong>Bold</strong><script>no</script></p>",
    };
    const minimalData = { job_title: "J", company: "C", start_date: "S", end_date: "E", description: "<p>D</p>" };

    test("should validate correct data and sanitize description", () => {
      const result = ExperienceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        // Check sanitization
        expect(result.data.description).toBe("<p>Desc <strong>Bold</strong></p>");
      }
    });

    test("should fail if required fields are missing/empty", () => {
      expect(
        ExperienceSchema.safeParse({ company: "C", start_date: "S", end_date: "E", description: "D" }).success,
      ).toBe(false); // Missing job_title
      expect(
        ExperienceSchema.safeParse({ job_title: "J", start_date: "S", end_date: "E", description: "D" }).success,
      ).toBe(false); // Missing company
      // ... test other required fields
      expect(
        ExperienceSchema.safeParse({ job_title: "J", company: "C", start_date: "S", end_date: "E", description: "" })
          .success,
      ).toBe(false); // Empty description
    });
  });

  describe("SkillsSchema", () => {
    test("should validate correct data", () => {
      expect(SkillsSchema.safeParse({ technical: ["React"], soft: ["Comms"] }).success).toBe(true);
    });
    test("should provide default empty arrays", () => {
      const result = SkillsSchema.safeParse({}); // Pass empty object
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.technical).toEqual([]);
        expect(result.data.soft).toEqual([]);
      }
      // Also test with undefined
      const resultUndef = SkillsSchema.safeParse({ technical: undefined, soft: undefined });
      expect(resultUndef.success).toBe(true);
      if (resultUndef.success) {
        expect(resultUndef.data.technical).toEqual([]);
        expect(resultUndef.data.soft).toEqual([]);
      }
    });
    test("should fail on invalid data types", () => {
      expect(SkillsSchema.safeParse({ technical: "not-an-array" }).success).toBe(false);
      expect(SkillsSchema.safeParse({ technical: [123] }).success).toBe(false); // Array of numbers
    });
  });

  describe("ProjectSchema", () => {
    const validData = {
      name: "Proj",
      description: "<p>Desc</p>",
      technologies: ["Tech"],
      url: " test.com ",
      repo: " github.com/user/repo ",
    };
    const minimalData = { name: "Min", description: "<p>D</p>" };
    const emptyOptionalData = { ...minimalData, technologies: undefined, url: "", repo: "" };

    test("should validate correct data, sanitize, and format URLs", () => {
      const result = ProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("<p>Desc</p>"); // Assumes sanitizeRichText works
        expect(result.data.url).toBe("https://test.com"); // trim + formatUrl + toLowerCase
        expect(result.data.repo).toBe("https://github.com/user/repo"); // trim + formatUrl + toLowerCase
        expect(result.data.technologies).toEqual(["Tech"]);
      }
    });
    test("should handle defaults and empty optionals", () => {
      const result = ProjectSchema.safeParse(emptyOptionalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.technologies).toEqual([]); // Default
        expect(result.data.url).toBeNull(); // Transform empty to null
        expect(result.data.repo).toBeNull(); // Transform empty to null
      }
    });
    test("should fail on missing required fields", () => {
      expect(ProjectSchema.safeParse({ description: "D" }).success).toBe(false); // Missing name
      expect(ProjectSchema.safeParse({ name: "N" }).success).toBe(false); // Missing description
    });
    test("should fail on invalid URLs", () => {
      expect(ProjectSchema.safeParse({ ...minimalData, url: "invalid url" }).success).toBe(false);
      expect(ProjectSchema.safeParse({ ...minimalData, repo: "github.com/invalid" }).success).toBe(false); // Missing repo name
    });
  });

  describe("CertificationSchema", () => {
    // Similar tests: valid, minimal, empty optional, missing required
    const validData = { name: " Cert ", issued_by: " Org ", date: " 2023 " };
    const minimalData = { name: "MinCert" };
    const emptyOptionalData = { ...minimalData, issued_by: "", date: "" };

    test("should validate correct data", () => {
      /* ... check trims ... */
      const result = CertificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Cert");
        expect(result.data.issued_by).toBe("Org");
        expect(result.data.date).toBe("2023");
      }
    });
    test("should transform empty optionals to null", () => {
      /* ... check nulls ... */
      const result = CertificationSchema.safeParse(emptyOptionalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.issued_by).toBeNull();
        expect(result.data.date).toBeNull();
      }
    });
    test("should fail if name is missing/empty", () => {
      /* ... check failure ... */
      expect(CertificationSchema.safeParse({}).success).toBe(false);
      expect(CertificationSchema.safeParse({ name: " " }).success).toBe(false);
    });
  });

  describe("PortfolioSchema (Integration)", () => {
    const minimalValidPortfolio: Portfolio = {
      template: 1,
      personal: {
        name: "Name",
        job_title: "Job",
        email: null,
        phone: null,
        linkedin: null,
        github: null,
        location: null,
      },

      professional_summary: null,
      education: [],
      experience: [],
      skills: { technical: [], soft: [] },
      projects: [],
      certifications: [],
    };

    test("should validate a minimally correct portfolio", () => {
      const result = PortfolioSchema.safeParse(minimalValidPortfolio);
      expect(result.success).toBe(true);
      if (result.success) {
        // Check defaults were applied if not explicitly provided
        expect(result.data.education).toEqual([]);
        expect(result.data.skills).toEqual({ technical: [], soft: [] });
        expect(result.data.projects).toEqual([]);
        expect(result.data.certifications).toEqual([]);
      }
    });

    test("should use defaults for arrays/objects if omitted", () => {
      const dataMissingDefaults = {
        template: 1,
        personal: {
          name: "Name",
          job_title: "Job",
          email: null,
          phone: null,
          linkedin: null,
          github: null,
          location: null,
        },
        professional_summary: "",
        // education, experience, skills, projects, certifications omitted
      };
      const result = PortfolioSchema.safeParse(dataMissingDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.education).toEqual([]);
        expect(result.data.experience).toEqual([]);
        expect(result.data.skills).toEqual({ technical: [], soft: [] });
        expect(result.data.projects).toEqual([]);
        expect(result.data.certifications).toEqual([]);
        expect(result.data.professional_summary).toBeNull();
      }
    });

    test("should fail if required top-level fields are missing", () => {
      const { template, ...invalidMissingTemplate } = minimalValidPortfolio;
      expect(PortfolioSchema.safeParse(invalidMissingTemplate).success).toBe(false);

      const { personal, ...invalidMissingPersonal } = minimalValidPortfolio;
      expect(PortfolioSchema.safeParse(invalidMissingPersonal).success).toBe(false);
    });

    test("should fail if nested required fields are missing", () => {
      const invalid = {
        ...minimalValidPortfolio,
        personal: { job_title: "Job" }, // Missing name in personal
      };
      expect(PortfolioSchema.safeParse(invalid).success).toBe(false);

      const invalid2 = {
        ...minimalValidPortfolio,
        experience: [{ company: "C", start_date: "S", end_date: "E", description: "D" }], // Missing job_title in experience item
      };
      expect(PortfolioSchema.safeParse(invalid2).success).toBe(false);
    });

    test("should correctly handle professional_summary sanitization and null transform", () => {
      const result1 = PortfolioSchema.safeParse({ ...minimalValidPortfolio, professional_summary: " <p>Summary</p> " });
      expect(result1.success).toBe(true);
      expect(result1.success && result1.data.professional_summary).toBe("<p>Summary</p>");

      const result2 = PortfolioSchema.safeParse({ ...minimalValidPortfolio, professional_summary: " " });
      expect(result2.success).toBe(true);
      expect(result2.success && result2.data.professional_summary).toBeNull();

      const result3 = PortfolioSchema.safeParse({ ...minimalValidPortfolio, professional_summary: null });
      expect(result3.success).toBe(true);
      expect(result3.success && result3.data.professional_summary).toBeNull();
    });
  });
});
