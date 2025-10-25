import { ExternalLink, Folder, Github } from "lucide-react";

import { Portfolio } from "@/types";

const ProjectsSection = ({ projects }: { projects: Portfolio["projects"] }) => {
  return (
    <section id="projects" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="text-4xl font-bold text-[#64ffda]">Projects</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {projects?.map((project, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md"
          >
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Folder size={22} className="text-[#64ffda]" aria-hidden="true" />
              {project.name}
            </h3>

            <div dangerouslySetInnerHTML={{ __html: project.description }} />

            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="rounded-full bg-[#64ffda] px-3 py-1 text-sm text-gray-900 shadow-md">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-4">
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition hover:text-[#64ffda]"
                >
                  <Github size={22} aria-hidden="true" />
                  <span className="text-sm">GitHub</span>
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition hover:text-[#64ffda]"
                >
                  <ExternalLink size={22} aria-hidden="true" />
                  <span className="text-sm">Live Demo</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
