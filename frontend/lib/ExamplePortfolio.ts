import { Portfolio } from "@/types";

const ExamplePortfolio: Portfolio = {
  template: 1,
  personal: {
    name: "John Doe",
    job_title: "Software Engineer",
    email: "johndoe@example.com",
    phone: "+1 234 567 8901",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    location: "San Francisco, CA, USA",
  },
  professional_summary:
    "A passionate software engineer with 5 years of experience in full-stack web development. Skilled in JavaScript, React, and Node.js.",
  education: [
    {
      degree: "BSc Computer Science",
      institution: "University of California, Berkeley",
      grade: "3.9 GPA",
      start_date: "2015",
      end_date: "2019",
    },
  ],
  experience: [
    {
      job_title: "Frontend Developer",
      company: "TechCorp Inc.",
      start_date: "2020",
      end_date: "Present",
      description:
        "Developing and maintaining the company's main web application using React and Next.js. Collaborating with designers to create user-friendly UI/UX. Optimizing application performance and accessibility. Implemented a new UI component library, reducing development time by 30%. Led a team of 4 developers in a successful product launch.",
    },
  ],
  skills: {
    technical: ["JavaScript", "React", "Next.js", "Node.js", "MongoDB"],
    soft: ["Teamwork", "Problem-solving", "Communication"],
  },
  projects: [
    {
      name: "Portfolio Builder",
      description: "A web application that helps users create personal portfolios.",
      technologies: ["React", "Next.js", "MongoDB"],
      url: "https://www.google.com",
      repo: "https://www.github.com",
    },
  ],
  certifications: [
    {
      name: "Certified React Developer",
      issued_by: "React Academy",
      date: "2022-05-15",
    },
  ],
};

export default ExamplePortfolio;
