"use client";

import { useState } from "react";
import axios from "axios";
import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AIEnhanceModal from "@/components/AiEnhanceModal";
import RTEditor from "@/components/RTEditor";

import { Portfolio } from "@/types";

const ProfessionalSummarySection = () => {
  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<Portfolio>();

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [original, setOriginal] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  const handleImprove = async () => {
    setAiLoading(true);
    try {
      const original = getValues("professional_summary") ?? "";
      setOriginal(original);
      const { data } = await axios.post("/api/ai-enhance", {
        section: "professional_summary",
        text: original,
      });

      setSuggestion(data.text);
      setDialogOpen(true);
    } catch (e) {
      toast.error("Failed to improve summary. Please try again.");
    } finally {
      setAiLoading(false);
    }
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
      disabled={aiLoading}
      className="rounded border px-2 py-1 text-sm hover:bg-gray-800 disabled:opacity-50"
    >
      <Sparkles aria-hidden="true" />
      {aiLoading ? "Improving…" : "Improve with AI"}
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
