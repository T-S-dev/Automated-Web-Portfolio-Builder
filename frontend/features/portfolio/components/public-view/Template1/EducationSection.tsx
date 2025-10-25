import { BookOpen, Calendar } from "lucide-react";

import { Portfolio } from "@/types";

const EducationSection = ({ education }: { education: Portfolio["education"] }) => {
  return (
    <section id="education" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="text-4xl font-bold text-[#64ffda]">Education</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {education?.map((edu, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <BookOpen size={22} className="text-[#64ffda]" aria-hidden="true" />
              {edu.degree}
            </h3>

            <h4 className="text-xl font-medium text-gray-300">{edu.institution}</h4>

            {edu.grade && <p className="text-lg text-gray-400">Grade: {edu.grade}</p>}

            <h5 className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={18} aria-hidden="true" />
              {edu.start_date} - {edu.end_date}
            </h5>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationSection;
