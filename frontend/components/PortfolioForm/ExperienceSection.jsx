import { useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";

import RTEditor from "@/components/RTEditor";

const ExperienceSection = ({ control, register, setValue, getValues, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <>
      {fields.map((exp, index) => (
        <div key={exp.id} className="my-2 flex flex-col space-y-2 rounded-md border p-4 pb-2">
          <label>
            Job Title
            <input {...register(`experience.${index}.job_title`)} type="text" placeholder="Job Title" />
            {errors.experience?.[index]?.job_title && (
              <span className="text-sm text-red-500">{errors.experience[index].job_title.message}</span>
            )}
          </label>

          <label>
            Company
            <input {...register(`experience.${index}.company`)} type="text" placeholder="Company" />
            {errors.experience?.[index]?.company && (
              <span className="text-sm text-red-500">{errors.experience[index].company.message}</span>
            )}
          </label>

          <div className="flex w-full items-center space-x-2">
            <label className="w-full">
              Start Year
              <input {...register(`experience.${index}.start_date`)} type="text" placeholder="Start Year" />
              {errors.experience?.[index]?.start_date && (
                <span className="text-sm text-red-500">{errors.experience[index].start_date.message}</span>
              )}
            </label>

            <label className="w-full">
              End Year
              <input {...register(`experience.${index}.end_date`)} type="text" placeholder="End Year (or 'Present')" />
              {errors.experience?.[index]?.end_date && (
                <span className="text-sm text-red-500">{errors.experience[index].end_date.message}</span>
              )}
            </label>
          </div>

          <label>Description</label>
          <RTEditor
            name={`experience.${index}.description`}
            setValue={setValue}
            defaultValue={getValues(`experience.${index}.description`)}
          />
          {errors.experience?.[index]?.description && (
            <span className="text-sm text-red-500">{errors.experience[index].description.message}</span>
          )}

          <button
            aria-label="Remove experience"
            className="mx-auto text-white hover:text-gray-600"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        className="mt-2 text-blue-500"
        onClick={() =>
          append({ job_title: "", company: "", start_date: "", end_date: "", responsibilities: [], achievements: [] })
        }
      >
        + Add Experience
      </button>
    </>
  );
};

export default ExperienceSection;
