const ProfessionalSummarySection = ({ professional_summary }) => {
  return (
    <section id="professional_summary" className="flex flex-col justify-center gap-8 p-4">
      <h2 className="flex items-center gap-2 text-4xl font-bold text-[#64ffda]">About Me</h2>

      <div className="w-full text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: professional_summary }} />
    </section>
  );
};

export default ProfessionalSummarySection;
