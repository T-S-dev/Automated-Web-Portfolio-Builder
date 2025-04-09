import { useFieldArray } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { Trash2 } from "lucide-react";

import RTEditor from "@/components/RTEditor";

import selectStyles from "@/lib/selectStyles";
import { formatUrl, handleSelectKeyDown } from "@/lib/utils";

const ProjectsSection = ({ control, register, setValue, getValues, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <>
      {fields.map((project, index) => (
        <div key={project.id} className="my-2 flex flex-col space-y-2 rounded-md border p-4 pb-2">
          <label>
            Project Name
            <input {...register(`projects.${index}.name`)} type="text" placeholder="Project Name" />
            {errors.projects?.[index]?.name && (
              <span className="text-sm text-red-500">{errors.projects[index].name.message}</span>
            )}
          </label>

          <label>
            Project URL
            <input
              {...register(`projects.${index}.url`, {
                setValueAs: (v) => {
                  return formatUrl(v);
                },
              })}
              type="url"
              placeholder="Project URL"
            />
            {errors.projects?.[index]?.url && (
              <span className="text-sm text-red-500">{errors.projects[index].url.message}</span>
            )}
          </label>

          <label>
            Project Repo
            <input
              {...register(`projects.${index}.repo`, {
                setValueAs: (v) => {
                  return formatUrl(v);
                },
              })}
              type="url"
              placeholder="Project Repo"
            />
            {errors.projects?.[index]?.repo && (
              <span className="text-sm text-red-500">{errors.projects[index].repo.message}</span>
            )}
          </label>

          <label>Project Description</label>
          <RTEditor
            name={`projects.${index}.description`}
            setValue={setValue}
            defaultValue={getValues(`projects.${index}.description`)}
          />

          {errors.projects?.[index]?.description && (
            <span className="text-sm text-red-500">{errors.projects[index].description.message}</span>
          )}

          <label>
            Technologies Used
            <CreatableSelect
              styles={selectStyles}
              placeholder="Technologies used..."
              isMulti
              value={
                getValues(`projects.${index}.technologies`)?.map((tech) => ({
                  value: tech,
                  label: tech,
                })) || []
              }
              onChange={(selected) =>
                setValue(
                  `projects.${index}.technologies`,
                  selected.map((option) => option.value),
                )
              }
              onKeyDown={handleSelectKeyDown}
            />
            {errors.projects?.[index]?.technologies && (
              <span className="text-sm text-red-500">{errors.projects[index].technologies.message}</span>
            )}
          </label>

          <button
            aria-label="Remove project"
            className="mx-auto text-white hover:text-gray-500"
            onClick={() => remove(index)}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        className="mt-2 text-blue-500"
        onClick={() => append({ name: "", url: "", repo: "", description: "", technologies: [] })}
        type="button"
      >
        + Add Project
      </button>
    </>
  );
};

export default ProjectsSection;
