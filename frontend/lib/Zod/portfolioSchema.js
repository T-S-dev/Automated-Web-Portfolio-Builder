import { z } from "zod";
import { formatUrl } from "@/lib/utils";
import sanitizeHtml from "sanitize-html";

const sanitizeRichText = (val) =>
  sanitizeHtml(val || "", {
    allowedTags: ["strong", "em", "u", "p", "span"],
    allowedAttributes: {
      span: ["style"],
    },
  });

export const PortfolioSchema = z.object({
  template: z.number().min(1, "Template is required"),
  personal: z.object({
    name: z.string().trim().min(1, "Name is required"),
    job_title: z.string().trim().min(1, "Job title is required"),
    email: z
      .string()
      .trim()
      .transform((val) => (val?.trim() === "" ? null : val))
      .refine((val) => val === null || /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val), "Invalid email format")
      .nullable()
      .optional(),

    phone: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .refine((val) => val === null || /^\+?[0-9\s\-().]{7,20}$/.test(val), "Invalid phone number format")
      .nullable()
      .optional(),

    linkedin: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
      .refine(
        (val) => val === null || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/.test(val),
        "Invalid LinkedIn profile URL",
      )
      .nullable()
      .optional(),

    github: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
      .refine(
        (val) => val === null || /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/?/.test(val),
        "Invalid GitHub profile URL",
      )
      .nullable()
      .optional(),

    location: z
      .string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .nullable()
      .optional(),
  }),

  professional_summary: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val?.trim() === "" ? null : sanitizeRichText(val))),

  education: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required").nullable().optional(),
        grade: z.string().nullable().optional(),
        start_date: z.string().min(1, "Start date is required").nullable().optional(),
        end_date: z.string().min(1, "End date is required").nullable().optional(),
      }),
    )
    .nullable()
    .optional()
    .default([]),

  experience: z
    .array(
      z.object({
        job_title: z.string().min(1, "Job title is required"),
        company: z.string().min(1, "Company is required"),
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().min(1, "End date is required"),
        description: z.string().min(1, "Description is required").transform(sanitizeRichText),
      }),
    )
    .nullable()
    .optional()
    .default([]),

  skills: z
    .object({
      technical: z.array(z.string()).nullable().optional().default([]),
      soft: z.array(z.string()).nullable().optional().default([]),
    })
    .nullable()
    .optional()
    .default({ technical: [], soft: [] }),

  projects: z
    .array(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().min(1, "Description is required").transform(sanitizeRichText),
        technologies: z.array(z.string()).nullable().optional().default([]),
        url: z
          .string()
          .trim()
          .transform((val) => (val?.trim() === "" ? null : formatUrl(val).toLowerCase()))
          .nullable()
          .refine(
            (val) => val === null || /^(https?:\/\/)?[a-zA-Z\d.-]+\.[a-zA-Z]{2,}\/?/.test(val),
            "Invalid project URL",
          )
          .optional(),
        repo: z
          .string()
          .trim()
          .transform((val) => (val === "" ? null : formatUrl(val).toLowerCase()))
          .nullable()
          .refine(
            (val) => val === null || /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+\/?$/.test(val),
            "Invalid GitHub repository URL",
          )
          .optional(),
      }),
    )
    .nullable()
    .optional()
    .default([]),

  certifications: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Certification name is required"),
        issued_by: z
          .string()
          .trim()
          .transform((val) => (val === "" ? null : val))
          .nullable()
          .optional(),
        date: z
          .string()
          .trim()
          .transform((val) => (val === "" ? null : val))
          .nullable()
          .optional(),
      }),
    )
    .nullable()
    .optional()
    .default([]),
});
