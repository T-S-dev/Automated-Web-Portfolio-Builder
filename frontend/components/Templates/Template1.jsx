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

const Template1 = ({ portfolio }) => {
  const { personal, professional_summary, education, experience, skills, projects, certifications } = portfolio;

  const sections = [
    { component: ProfessionalSummarySection, props: { professional_summary }, condition: professional_summary },
    { component: EducationSection, props: { education }, condition: education?.length },
    { component: ExperienceSection, props: { experience }, condition: experience?.length },
    {
      component: SkillsSection,
      props: { skills },
      condition: skills?.technical?.length || skills?.soft?.length,
    },
    { component: ProjectsSection, props: { projects }, condition: projects?.length },
    { component: CertificationsSection, props: { certifications }, condition: certifications?.length },
  ];

  return (
    <div className="relative text-[#ccd6f6]">
      <Header portfolio={portfolio} />

      <main className="container mx-auto flex flex-col gap-20">
        <PersonalSection personal={personal} />

        {/* Dynamically render sections based on conditions */}
        {sections.map(({ component: Section, props, condition }, index) =>
          condition ? <Section key={index} {...props} /> : null,
        )}
      </main>
    </div>
  );
};

export default Template1;
