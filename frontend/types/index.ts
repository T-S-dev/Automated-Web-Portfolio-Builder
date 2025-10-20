import { type Portfolio as BasePortfolio } from "@/lib/Zod/portfolioSchema";

export type Portfolio = BasePortfolio;

export type PortfolioDocument = Portfolio & {
  is_private: boolean;
  username: string;
  clerkId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardPortfolio = {
  personal: {
    name: string;
  };
  is_private: boolean;
  username: string;
};

export type ParsedResume = {
  personal: {
    name: string | null;
    job_title: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    location: string | null;
  };
  professional_summary: string | null;
  education: Array<{
    degree: string | null;
    institution: string | null;
    grade: string | null;
    start_date: string | null;
    end_date: string | null;
  }> | null;
  experience: Array<{
    job_title: string | null;
    company: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
  }> | null;
  skills: {
    technical: string[] | null;
    soft: string[] | null;
  } | null;
  projects: Array<{
    name: string | null;
    description: string | null;
    technologies: string[] | null;
    url: string | null;
    repo: string | null;
  }> | null;
  certifications: Array<{
    name: string | null;
    issued_by: string | null;
    date: string | null;
  }> | null;
};
