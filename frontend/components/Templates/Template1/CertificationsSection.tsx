import { Award, Calendar } from "lucide-react";

import { Portfolio } from "@/types";

const CertificationsSection = ({ certifications }: { certifications: Portfolio["certifications"] }) => {
  return (
    <section id="certifications" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="text-4xl font-bold text-[#64ffda]">Certifications</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {certifications?.map((cert, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-md transition hover:scale-[102%] hover:shadow-lg"
          >
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Award size={28} className="text-[#64ffda]" aria-hidden="true" />
              {cert.name}
            </h3>

            {cert.issued_by && <p className="text-lg font-medium text-gray-300">{cert.issued_by}</p>}

            {cert.date && (
              <h5 className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={18} aria-hidden="true" />
                {cert.date}
              </h5>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificationsSection;
