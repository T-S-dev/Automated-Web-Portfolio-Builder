import {
  Header,
  PersonalSection,
  ProfessionalSummarySection,
  EducationSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
} from "@/components/Templates/Template1/index";

import { Portfolio } from "@/types";

type SectionConfig = {
  component: React.ComponentType<any>;
  props: object;
  shouldRender: boolean;
};

const Template1 = ({ portfolio }: { portfolio: Portfolio }) => {
  const { personal, professional_summary, education, experience, skills, projects, certifications } = portfolio;

  const sections: SectionConfig[] = [
    {
      component: ProfessionalSummarySection,
      props: { professional_summary },
      shouldRender: !!professional_summary,
    },
    {
      component: EducationSection,
      props: { education },
      shouldRender: (education?.length || 0) > 0,
    },
    {
      component: ExperienceSection,
      props: { experience },
      shouldRender: (experience?.length || 0) > 0,
    },
    {
      component: SkillsSection,
      props: { skills },
      shouldRender: !!(skills?.technical?.length || skills?.soft?.length),
    },
    {
      component: ProjectsSection,
      props: { projects },
      shouldRender: (projects?.length || 0) > 0,
    },
    {
      component: CertificationsSection,
      props: { certifications },
      shouldRender: (certifications?.length || 0) > 0,
    },
  ];

  return (
    <div className="relative text-[#ccd6f6]">
      <Header portfolio={portfolio} />

      <main className="container mx-auto flex flex-col gap-20">
        <PersonalSection personal={personal} />

        {/* Dynamically render sections based on conditions */}
        {sections.map(({ component: Section, props, shouldRender }, index) =>
          shouldRender ? <Section key={index} {...props} /> : null,
        )}
      </main>
    </div>
  );
};

export default Template1;
