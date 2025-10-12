import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

const EducationSection = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <>
      {fields.map((edu, index) => (
        <div key={edu.id} className="my-2 flex flex-col space-y-2 rounded-md border p-4 pb-2">
          <label>
            Degree
            <input {...register(`education.${index}.degree`)} type="text" placeholder="Degree" />
            {errors.education?.[index]?.degree && (
              <span className="text-sm text-red-500">{errors.education[index].degree.message}</span>
            )}
          </label>

          <label>
            Institution
            <input {...register(`education.${index}.institution`)} type="text" placeholder="Institution" />
            {errors.education?.[index]?.institution && (
              <span className="text-sm text-red-500">{errors.education[index].institution.message}</span>
            )}
          </label>

          <label>
            Grade
            <input {...register(`education.${index}.grade`)} type="text" placeholder="Grade" />
            {errors.education?.[index]?.grade && (
              <span className="text-sm text-red-500">{errors.education[index].grade.message}</span>
            )}
          </label>

          <div className="flex w-full items-center space-x-2">
            <label className="w-full">
              Start Year
              <input {...register(`education.${index}.start_date`)} type="text" placeholder="Start Year" />
              {errors.education?.[index]?.start_date && (
                <span className="text-sm text-red-500">{errors.education[index].start_date.message}</span>
              )}
            </label>

            <label className="w-full">
              End Year
              <input {...register(`education.${index}.end_date`)} type="text" placeholder="End Year" />
              {errors.education?.[index]?.end_date && (
                <span className="text-sm text-red-500">{errors.education[index].end_date.message}</span>
              )}
            </label>
          </div>

          <button
            aria-label="Remove education"
            className="mx-auto text-white hover:text-gray-500"
            onClick={() => {
              remove(index);
            }}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        className="mt-2 text-blue-500"
        onClick={() => {
          append({ degree: "", institution: "", start_date: "", end_date: "" });
        }}
        type="button"
      >
        + Add Education
      </button>
    </>
  );
};

export default EducationSection;
