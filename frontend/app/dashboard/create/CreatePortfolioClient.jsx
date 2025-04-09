"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import Dropzone from "@/components/Dropzone";
import PortfolioEditor from "@/components/PortfolioEditor";

const CreatePortfolioClient = () => {
  const [resumeData, setResumeData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (file) => {
    setProcessing(true);

    if (!file) {
      toast.error("No file uploaded");
      setProcessing(false);
      return;
    }

    // Validate file type (PDF or DOCX)
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF or DOCX file.");
      setProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResumeData(response.data);
      toast.success("Resume processed successfully!");
    } catch (error) {
      toast.error(error.response?.data.error || "Error processing resume");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      {resumeData ? (
        <PortfolioEditor portfolio={resumeData} mode="create" onCancel={() => setResumeData(null)} />
      ) : (
        <Dropzone onFileUpload={handleFileUpload} processing={processing} />
      )}
    </div>
  );
};

export default CreatePortfolioClient;
