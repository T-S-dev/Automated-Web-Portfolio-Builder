import { Schema, model, models } from "mongoose";

const PersonalSchema = new Schema({
  name: { type: String, required: true },
  job_title: { type: String, required: true },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  linkedin: { type: String, default: null },
  github: { type: String, default: null },
  location: { type: String, default: null },
});

const EducationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, default: null },
  grade: { type: String, default: null },
  start_date: { type: String, default: null },
  end_date: { type: String, default: null },
});

const ExperienceSchema = new Schema({
  job_title: { type: String, required: true },
  company: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  description: { type: String, required: true },
});

const SkillsSchema = new Schema({
  technical: { type: [String], default: [] },
  soft: { type: [String], default: [] },
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  url: { type: String, default: null },
  repo: { type: String, default: null },
});

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issued_by: { type: String, default: null },
  date: { type: String, default: null },
});

const PortfolioSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    clerkId: { type: String, required: true, unique: true },
    is_private: { type: Boolean, default: false },
    template: { type: Number, required: true },
    personal: { type: PersonalSchema, required: true },
    professional_summary: { type: String, default: null },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    skills: { type: SkillsSchema, default: { technical: [], soft: [] } },
    projects: { type: [ProjectSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
  },
  { timestamps: true },
);

export default models.Portfolio || model("Portfolio", PortfolioSchema);
