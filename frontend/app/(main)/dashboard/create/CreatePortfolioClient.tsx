"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import Dropzone from "@/features/portfolio/components/Dropzone";
import PortfolioEditor from "@/features/portfolio/components/PortfolioEditor";

import { normalizeParsedResume } from "@/shared/lib/normalizeResume";
import { parseResumeAction } from "@/features/portfolio/actions";

import { Portfolio } from "@/types";

const CreatePortfolioClient = () => {
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
  const [isProcessing, startProcessingTransition] = useTransition();

  const handleFileUpload = (file: File) => {
    startProcessingTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await parseResumeAction(formData);

      if (result.success) {
        setPortfolioData(normalizeParsedResume(result.data));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      {portfolioData ? (
        <PortfolioEditor
          className="p-4 pb-0"
          portfolio={portfolioData}
          mode="create"
          onCancel={() => setPortfolioData(null)}
        />
      ) : (
        <Dropzone className="m-8" onFileUpload={handleFileUpload} processing={isProcessing} />
      )}
    </div>
  );
};

export default CreatePortfolioClient;
