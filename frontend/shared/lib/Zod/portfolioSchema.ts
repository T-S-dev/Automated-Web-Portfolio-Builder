import { z } from "zod";
import sanitizeHtml from "sanitize-html";

import { formatUrl, sanitizeOptions } from "@/shared/lib/utils";

const sanitizeRichText = (val: string | null | undefined) => sanitizeHtml(val || "", sanitizeOptions);

const preprocessOptionalString = (val: unknown): string | null => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  }

  return val === undefined || val === null ? null : String(val);
};

export const PersonalSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  job_title: z.string().trim().min(1, "Job title is required"),
  email: z.preprocess(preprocessOptionalString, z.email("Invalid email").nullable()),
  phone: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => val === null || /^\+?[0-9\s\-().]{7,20}$/.test(val), "Invalid phone number format")
    .nullable(),
  linkedin: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
    .refine(
      (val) => val === null || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/.test(val),
      "Invalid LinkedIn profile URL",
    )
    .nullable(),
  github: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
    .refine(
      (val) => val === null || /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/.test(val),
      "Invalid GitHub profile URL",
    )
    .nullable(),
  location: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullable(),
});

export const EducationSchema = z.object({
  degree: z.string().trim().min(1, "Degree is required"),
  institution: z
    .string()
    .trim()
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable(),
  grade: z
    .string()
    .trim()
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable(),
  start_date: z
    .string()
    .trim()
    .min(1, "Start date is required")
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable(),
  end_date: z
    .string()
    .trim()
    .min(1, "End date is required")
    .transform((val) => (val?.trim() === "" ? null : val))
    .nullable(),
});

export const ExperienceSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  description: z.string().min(1, "Description is required").transform(sanitizeRichText),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).default([]),
  soft: z.array(z.string()).default([]),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required").transform(sanitizeRichText),
  technologies: z.array(z.string()).default([]),
  url: z
    .string()
    .trim()
    .transform((val) => (val?.trim() === "" ? null : formatUrl(val).toLowerCase()))
    .refine((val) => val === null || /^(https?:\/\/)?[a-zA-Z\d.-]+\.[a-zA-Z]{2,}\/?/.test(val), "Invalid project URL")
    .nullable(),
  repo: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
    .refine(
      (val) => val === null || /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+\/?$/.test(val),
      "Invalid GitHub repository URL",
    )
    .nullable(),
});

export const CertificationSchema = z.object({
  name: z.string().trim().min(1, "Certification name is required"),
  issued_by: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullable(),
  date: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullable(),
});

export const PortfolioSchema = z.object({
  template: z.number().min(1, "Template is required"),
  personal: PersonalSchema,
  professional_summary: z
    .string()
    .trim()
    .transform((val) => (val?.trim() === "" ? null : sanitizeRichText(val)))
    .nullable(),
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  skills: SkillsSchema.default({ technical: [], soft: [] }),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
});

export type Personal = z.infer<typeof PersonalSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
