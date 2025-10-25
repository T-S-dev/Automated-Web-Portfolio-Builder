import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { Portfolio } from "@/types";

const Template2 = ({ portfolio }: { portfolio: Portfolio }) => {
  const { personal, professional_summary, education, experience, skills, projects, certifications } = portfolio;

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{personal.name}</h1>
          <p className="text-xl">{personal.job_title}</p>
        </div>
      </header>

      <main className="container mx-auto space-y-12 px-4 py-8">
        <section id="personal" className="space-y-4">
          <h2 className="text-2xl font-semibold">Personal</h2>
          <div className="flex items-center space-x-6">
            <div>
              {personal.job_title && <p>Job Title: {personal.job_title}</p>}
              {personal.email && <p>Email: {personal.email}</p>}
              {personal.phone && <p>Phone: {personal.phone}</p>}
              {personal.github && <p>GitHub: {personal.github}</p>}
              {personal.linkedin && <p>LinkedIn: {personal.linkedin}</p>}
              {personal.location && <p>Location: {personal.location}</p>}
            </div>
          </div>
        </section>

        {professional_summary && (
          <section id="professional_summary" className="space-y-4">
            <h2 className="text-2xl font-semibold">Professional Summary</h2>
            <div dangerouslySetInnerHTML={{ __html: professional_summary }}></div>
          </section>
        )}

        {education && (
          <section id="education" className="space-y-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            {education?.map((edu, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p>{edu.institution}</p>
                  <p>{edu.grade}</p>
                  <p>
                    {edu.start_date} - {edu.end_date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {experience && (
          <section id="experience" className="space-y-4">
            <h2 className="text-2xl font-semibold">Experience</h2>
            {experience?.map((exp, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{exp.job_title}</h3>
                  <p>{exp.company}</p>
                  <p>
                    {exp.start_date} - {exp.end_date}
                  </p>
                  <div
                    className="mt-3 flex flex-col gap-2 text-gray-300"
                    dangerouslySetInnerHTML={{ __html: exp.description }}
                  />
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {skills && (
          <section id="skills" className="space-y-4">
            <h2 className="text-2xl font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.technical?.map((skill, index) => (
                <Badge key={index}>{skill}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.soft?.map((skill, index) => (
                <Badge key={index}>{skill}</Badge>
              ))}
            </div>
          </section>
        )}

        {projects && (
          <section id="projects" className="space-y-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {projects?.map((project, index) => (
                <Card key={index}>
                  <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                    <h3 className="font-semibold">{project.name}</h3>
                    <div dangerouslySetInnerHTML={{ __html: project.description }} />
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech, i) => (
                        <Badge key={i}>{tech}</Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-4">
                      {project.repo && (
                        <Button className="flex-1" variant="outline" asChild>
                          <a href={project.repo} target="_blank" rel="noopener noreferrer">
                            <span className="text-sm">GitHub</span>
                          </a>
                        </Button>
                      )}
                      {project.url && (
                        <Button className="flex-1" variant="outline" asChild>
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            <span className="text-sm">Live Demo</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {certifications && (
          <section id="certifications" className="space-y-4">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {certifications?.map((cert, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p>{cert.issued_by}</p>
                    <p>{cert.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Template2;
