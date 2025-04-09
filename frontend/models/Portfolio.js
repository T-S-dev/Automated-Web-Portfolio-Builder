import { Schema, model, models } from "mongoose";

const PersonalSchema = new Schema({
  name: { type: String },
  job_title: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  github: { type: String },
  location: { type: String },
});

const EducationSchema = new Schema({
  degree: { type: String },
  institution: { type: String },
  grade: { type: String },
  start_date: { type: String },
  end_date: { type: String },
});

const ExperienceSchema = new Schema({
  job_title: { type: String },
  company: { type: String },
  start_date: { type: String },
  end_date: { type: String },
  description: { type: String },
});

const SkillsSchema = new Schema({
  technical: { type: [String], default: [] },
  soft: { type: [String], default: [] },
});

const ProjectSchema = new Schema({
  name: { type: String },
  description: { type: String },
  technologies: { type: [String], default: [] },
  url: { type: String },
  repo: { type: String },
});

const CertificationSchema = new Schema({
  name: { type: String },
  issued_by: { type: String },
  date: { type: String },
});

const PortfolioSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    clerkId: { type: String, required: true, unique: true },
    template: { type: Number, required: true },
    is_private: { type: Boolean, default: false },
    personal: { type: PersonalSchema },
    professional_summary: { type: String },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    skills: { type: SkillsSchema },
    projects: { type: [ProjectSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
  },
  { timestamps: true },
);

export default models.Portfolio || model("Portfolio", PortfolioSchema);
