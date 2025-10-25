import { Briefcase, Calendar } from "lucide-react";

import { Portfolio } from "@/types";

const ExperienceSection = ({ experience }: { experience: Portfolio["experience"] }) => {
  return (
    <section id="experience" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="text-4xl font-bold text-[#64ffda]">Experience</h2>

      <div className="w-full max-w-3xl space-y-6">
        {experience?.map((exp, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Briefcase size={22} className="text-[#64ffda]" aria-hidden="true" />
              {exp.job_title}
            </h3>

            <h4 className="text-xl font-medium text-gray-300">{exp.company}</h4>

            <h5 className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={18} aria-hidden="true" />
              {exp.start_date} - {exp.end_date}
            </h5>

            <div
              className="mt-3 flex flex-col gap-2 text-gray-300"
              dangerouslySetInnerHTML={{ __html: exp.description }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
