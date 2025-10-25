"use client";

import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import AIEnhanceModal from "@/features/portfolio/components/AiEnhanceModal";
import RTEditor from "@/features/portfolio/components/RTEditor";

import { aiEnhanceAction } from "../../actions";

import { Portfolio } from "@/types";

const ProfessionalSummarySection = () => {
  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<Portfolio>();
  const [isImproving, startImproveTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [original, setOriginal] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  const handleImprove = () => {
    startImproveTransition(async () => {
      const originalContent = getValues("professional_summary") || "";
      setOriginal(originalContent);

      const result = await aiEnhanceAction({
        section: "professional_summary",
        text: originalContent,
      });

      if (result.success) {
        setSuggestion(result.data.text);
        setDialogOpen(true);
      } else {
        toast.error(result.error);
      }
    });
  };

  const acceptSuggestion = () => {
    setValue("professional_summary", suggestion);
    setDialogOpen(false);
    toast.success("Summary updated!");
  };

  const improveButton = (
    <Button
      variant="ghost"
      type="button"
      onClick={handleImprove}
      disabled={isImproving}
      className="rounded border px-2 py-1 text-sm hover:bg-gray-800 disabled:opacity-50"
    >
      <Sparkles aria-hidden="true" />
      {isImproving ? "Improving…" : "Improve with AI"}
    </Button>
  );

  return (
    <div>
      <RTEditor
        name="professional_summary"
        setValue={setValue}
        content={getValues("professional_summary")}
        extraToolbarButtons={[improveButton]}
      />
      {errors.professional_summary && (
        <span className="text-sm text-red-500">{errors.professional_summary.message}</span>
      )}

      <AIEnhanceModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={"Review AI Suggested Summary"}
        original={original}
        suggestion={suggestion}
        onAccept={acceptSuggestion}
      />
    </div>
  );
};

export default ProfessionalSummarySection;
