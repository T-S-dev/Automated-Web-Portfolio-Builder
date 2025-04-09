import RTEditor from "@/components/RTEditor";

const ProfessionalSummarySection = ({ setValue, getValues, errors }) => {
  return (
    <>
      <RTEditor name="professional_summary" setValue={setValue} defaultValue={getValues("professional_summary")} />
      {errors.professional_summary && (
        <span className="text-sm text-red-500">{errors.professional_summary.message}</span>
      )}
    </>
  );
};

export default ProfessionalSummarySection;
