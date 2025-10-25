"use client";

import { useState } from "react";
import axios from "axios";
import { Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import AIEnhanceModal from "@/features/portfolio/components/AiEnhanceModal";
import RTEditor from "@/features/portfolio/components/RTEditor";

import selectStyles from "@/shared/constants/selectStyles";
import { formatUrl, handleSelectKeyDown } from "@/shared/lib/utils";

import { Portfolio } from "@/types";
import { aiEnhanceAction } from "../../actions";

const ProjectsSection = () => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<Portfolio>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  const [aiLoadingIndex, setAiLoadingIndex] = useState<number | null>(null);
  const [currentAiIndex, setCurrentAiIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [original, setOriginal] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  const handleImprove = async (index: number) => {
    setAiLoadingIndex(index);
    try {
      const originalContent = getValues(`projects.${index}.description`) || "";
      setOriginal(originalContent);
      setCurrentAiIndex(index);

      const result = await aiEnhanceAction({
        section: "project_description",
        text: original,
      });

      if (result.success) {
        setSuggestion(result.data.text);
        setDialogOpen(true);
      } else {
        toast.error(result.error);
      }
    } finally {
      setAiLoadingIndex(null);
    }
  };

  const acceptSuggestion = () => {
    if (currentAiIndex === null) return;

    setValue(`projects.${currentAiIndex}.description`, suggestion);
    setDialogOpen(false);
    toast.success("Project description updated!");
  };

  return (
    <>
      {fields.map((project, index) => {
        const isImproving = aiLoadingIndex !== null;
        const improveButton = (
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleImprove(index)}
            disabled={isImproving}
            className="rounded border px-2 py-1 text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            <Sparkles aria-hidden="true" />
            {aiLoadingIndex === index ? "Improving…" : "Improve with AI"}
          </Button>
        );

        return (
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
              content={getValues(`projects.${index}.description`)}
              extraToolbarButtons={[improveButton]}
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
        );
      })}

      <button
        className="mt-2 text-blue-500"
        onClick={() => append({ name: "", url: "", repo: "", description: "", technologies: [] })}
        type="button"
      >
        + Add Project
      </button>

      <AIEnhanceModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={"Review AI Suggested Description"}
        original={original}
        suggestion={suggestion}
        onAccept={acceptSuggestion}
      />
    </>
  );
};

export default ProjectsSection;
