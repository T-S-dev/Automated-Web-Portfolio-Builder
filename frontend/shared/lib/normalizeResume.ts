import { ParsedResume, Portfolio } from "@/types";

export function normalizeParsedResume(parsed: ParsedResume): Portfolio {
  return {
    template: 1,
    personal: {
      name: parsed.personal?.name ?? "",
      job_title: parsed.personal?.job_title ?? "",
      email: parsed.personal?.email ?? "",
      phone: parsed.personal?.phone ?? "",
      linkedin: parsed.personal?.linkedin ?? "",
      github: parsed.personal?.github ?? "",
      location: parsed.personal?.location ?? "",
    },
    professional_summary: parsed.professional_summary ?? "",
    education:
      parsed.education?.map((e) => ({
        degree: e.degree ?? "",
        institution: e.institution ?? "",
        grade: e.grade ?? "",
        start_date: e.start_date ?? "",
        end_date: e.end_date ?? "",
      })) ?? [],
    experience:
      parsed.experience?.map((exp) => ({
        job_title: exp.job_title ?? "",
        company: exp.company ?? "",
        start_date: exp.start_date ?? "",
        end_date: exp.end_date ?? "",
        description: exp.description ?? "",
      })) ?? [],
    skills: {
      technical: parsed.skills?.technical ?? [],
      soft: parsed.skills?.soft ?? [],
    },
    projects:
      parsed.projects?.map((p) => ({
        name: p.name ?? "",
        description: p.description ?? "",
        technologies: p.technologies ?? [],
        url: p.url ?? "",
        repo: p.repo ?? "",
      })) ?? [],
    certifications:
      parsed.certifications?.map((c) => ({
        name: c.name ?? "",
        issued_by: c.issued_by ?? "",
        date: c.date ?? "",
      })) ?? [],
  };
}
