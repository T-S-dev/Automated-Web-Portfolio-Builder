import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { Portfolio } from "@/types";

const CertificationsSection = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<Portfolio>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  return (
    <>
      {fields.map((cert, index) => (
        <div key={cert.id} className="my-2 flex flex-col space-y-2 rounded-md border p-4 pb-2">
          <label>
            Certification Name
            <input {...register(`certifications.${index}.name`)} type="text" placeholder="Certification Name" />
            {errors.certifications?.[index]?.name && (
              <span className="text-sm text-red-500">{errors.certifications[index].name.message}</span>
            )}
          </label>

          <label>
            Issuing Organization
            <input {...register(`certifications.${index}.issued_by`)} type="text" placeholder="Issuing Organization" />
            {errors.certifications?.[index]?.issued_by && (
              <span className="text-sm text-red-500">{errors.certifications[index].issued_by.message}</span>
            )}
          </label>

          <label>
            Date
            <input {...register(`certifications.${index}.date`)} type="text" placeholder="Date (e.g., 2023)" />
            {errors.certifications?.[index]?.date && (
              <span className="text-sm text-red-500">{errors.certifications[index].date.message}</span>
            )}
          </label>

          <button
            aria-label="Remove Certification"
            className="text-red-white mx-auto hover:text-gray-600"
            onClick={() => remove(index)}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        className="mt-2 text-blue-500"
        onClick={() => append({ name: "", issued_by: "", date: "" })}
        type="button"
      >
        + Add Certification
      </button>
    </>
  );
};

export default CertificationsSection;
