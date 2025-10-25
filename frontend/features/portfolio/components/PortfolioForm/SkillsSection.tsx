import { useFormContext } from "react-hook-form";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import selectStyles from "@/shared/constants/selectStyles";
import { handleSelectKeyDown } from "@/shared/lib/utils";

import { Portfolio } from "@/types";

type SelectOption = {
  value: string;
  label: string;
};

const SkillsSection = () => {
  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<Portfolio>();

  const handleSkillChange = (path: "skills.technical" | "skills.soft", selectedOptions: MultiValue<SelectOption>) => {
    setValue(
      path,
      selectedOptions.map((option) => option.value),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <div className="my-2 flex flex-col space-y-2 rounded-md border p-4 pb-2">
      <label htmlFor="technical-skills" className="block">
        Technical Skills
      </label>
      <CreatableSelect
        id="technical-skills"
        styles={selectStyles}
        placeholder="Type to add..."
        isMulti
        name="skills.technical"
        value={
          getValues("skills.technical")?.map((skill) => ({
            value: skill,
            label: skill,
          })) || []
        }
        onChange={(selected) => handleSkillChange("skills.technical", selected)}
        onKeyDown={handleSelectKeyDown}
      />
      {errors?.skills?.technical && <span className="text-sm text-red-500">{errors.skills.technical.message}</span>}

      <label htmlFor="soft skills" className="mt-4">
        Soft Skills
      </label>
      <CreatableSelect
        id="soft-skills"
        styles={selectStyles}
        placeholder="Type to add..."
        isMulti
        name="skills.soft"
        value={
          getValues("skills.soft")?.map((skill) => ({
            value: skill,
            label: skill,
          })) || []
        }
        onChange={(selected) => handleSkillChange("skills.soft", selected)}
        onKeyDown={handleSelectKeyDown}
      />
      {errors?.skills?.soft && <span className="text-sm text-red-500">{errors.skills.soft.message}</span>}
    </div>
  );
};

export default SkillsSection;
