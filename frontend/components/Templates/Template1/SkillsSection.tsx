import { Portfolio } from "@/types";
import { Code, Users } from "lucide-react";

const SkillsSection = ({ skills }: { skills: Portfolio["skills"] }) => {
  const { technical, soft } = skills || {};

  return (
    <section id="skills" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="text-4xl font-bold text-[#64ffda]">Skills</h2>

      <div className="grid gap-6 xl:grid-cols-2">
        {technical && technical.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Code size={22} className="text-[#64ffda]" aria-hidden="true" />
              Technical Skills
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {technical.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-full bg-[#64ffda] px-3 py-1 text-center text-gray-900 shadow-md"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {soft && soft.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Users size={22} className="text-[#64ffda]" aria-hidden="true" />
              Soft Skills
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {soft.map((skill, index) => (
                <span
                  key={index}
                  className="flex items-center justify-center rounded-full bg-[#22d652] px-3 py-1 text-center text-gray-900 shadow-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillsSection;
