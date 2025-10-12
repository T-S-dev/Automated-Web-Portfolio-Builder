import { formatUrl } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

const PersonalSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label>
          Full Name
          <input {...register("personal.name")} type="text" />
          {errors.personal?.name && <span className="text-sm text-red-500">{errors.personal.name.message}</span>}
        </label>

        <label>
          Job Title
          <input {...register("personal.job_title")} type="text" />
          {errors.personal?.job_title && (
            <span className="text-sm text-red-500">{errors.personal.job_title.message}</span>
          )}
        </label>

        <label>
          Email
          <input {...register("personal.email")} type="email" />
          {errors.personal?.email && <span className="text-sm text-red-500">{errors.personal.email.message}</span>}
        </label>

        <label>
          Phone
          <input {...register("personal.phone")} type="text" />
          {errors.personal?.phone && <span className="text-sm text-red-500">{errors.personal.phone.message}</span>}
        </label>

        <label>
          LinkedIn
          <input
            {...register("personal.linkedin", {
              setValueAs: (v) => {
                return formatUrl(v);
              },
            })}
            type="text"
          />
          {errors.personal?.linkedin && (
            <span className="text-sm text-red-500">{errors.personal.linkedin.message}</span>
          )}
        </label>

        <label>
          GitHub
          <input
            {...register("personal.github", {
              setValueAs: (v) => {
                return formatUrl(v);
              },
            })}
            type="text"
          />
          {errors.personal?.github && <span className="text-sm text-red-500">{errors.personal.github.message}</span>}
        </label>

        <label>
          Location
          <input {...register("personal.location")} type="text" />
          {errors.personal?.location && (
            <span className="text-sm text-red-500">{errors.personal.location.message}</span>
          )}
        </label>
      </div>
    </>
  );
};

export default PersonalSection;
