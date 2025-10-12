"use client";

import { useState } from "react";
import axios from "axios";
import { Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import AIEnhanceModal from "@/components/AiEnhanceModal";
import { Button } from "@/components/ui/button";
import RTEditor from "@/components/RTEditor";

const ExperienceSection = () => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const [aiLoadingIndex, setAiLoadingIndex] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAiIndex, setCurrentAiIndex] = useState(null);
  const [original, setOriginal] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const handleImprove = async (index) => {
    setAiLoadingIndex(index);
    try {
      const original = getValues(`experience.${index}.description`) || "";
      setOriginal(original);
      setCurrentAiIndex(index);

      const { data } = await axios.post("/api/ai-enhance", {
        section: "experience_description",
        text: original,
      });
      setSuggestion(data.text);
      setDialogOpen(true);
    } catch (e) {
      toast.error("Failed to improve description. Please try again.");
    } finally {
      setAiLoadingIndex(null);
    }
  };

  const acceptSuggestion = () => {
    setValue(`experience.${currentAiIndex}.description`, suggestion);
    setDialogOpen(false);
    toast.success("Experience description updated!");
  };

  return (
    <>
      {fields.map((exp, index) => {
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
                <input
                  {...register(`experience.${index}.end_date`)}
                  type="text"
                  placeholder="End Year (or 'Present')"
                />
                {errors.experience?.[index]?.end_date && (
                  <span className="text-sm text-red-500">{errors.experience[index].end_date.message}</span>
                )}
              </label>
            </div>

            <label>Description</label>
            <RTEditor
              name={`experience.${index}.description`}
              setValue={setValue}
              content={getValues(`experience.${index}.description`)}
              extraToolbarButtons={[improveButton]}
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
        );
      })}

      <button
        className="mt-2 text-blue-500"
        onClick={() =>
          append({ job_title: "", company: "", start_date: "", end_date: "", responsibilities: [], achievements: [] })
        }
      >
        + Add Experience
      </button>

      <AIEnhanceModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={"Review AI Suggested Summary"}
        original={original}
        suggestion={suggestion}
        onAccept={acceptSuggestion}
      />
    </>
  );
};

export default ExperienceSection;
