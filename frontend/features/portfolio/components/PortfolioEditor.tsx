"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PortfolioForm from "@/features/portfolio/components/PortfolioForm";

import { cn } from "@/shared/lib/utils";
import { PortfolioSchema, type Portfolio } from "@/shared/lib/Zod/portfolioSchema";

type PortfolioEditorProps = {
  className?: string;
  portfolio: Portfolio;
  mode: "create" | "edit";
  onCancel: () => void;
};

const newPortfolioDefault: Portfolio = {
  template: 1,
  personal: { name: "", job_title: "", email: null, phone: null, linkedin: null, github: null, location: null },
  professional_summary: null,
  education: [],
  experience: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
};

const PortfolioEditor = ({ className, portfolio, mode, onCancel }: PortfolioEditorProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState<boolean>(false);

  const methods = useForm({
    resolver: zodResolver(PortfolioSchema),
    defaultValues: portfolio || newPortfolioDefault,
  });

  const { watch } = methods;
  const [watchedData, setWatchedData] = useState<Portfolio>(portfolio || newPortfolioDefault);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLivePreviewUrl(window.location.origin + "/live-preview");
    }

    const handleIframeReady = (event: MessageEvent) => {
      if (event.data?.status === "ready") {
        setIframeReady(true);
      }
    };

    window.addEventListener("message", handleIframeReady);
    return () => window.removeEventListener("message", handleIframeReady);
  }, []);

  useEffect(() => {
    const subscription = watch((updatedValues) => {
      setWatchedData(updatedValues as Portfolio);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow && watchedData && livePreviewUrl) {
      iframeRef.current.contentWindow.postMessage({ portfolioData: watchedData }, livePreviewUrl);
    }
  }, [iframeReady, watchedData, livePreviewUrl]);

  return (
    <FormProvider {...methods}>
      <div className={cn("flex flex-1 gap-4", className)}>
        <div className="flex flex-1 xl:max-h-[88vh] xl:overflow-y-auto xl:rounded-md xl:border xl:p-2">
          <PortfolioForm mode={mode} onCancel={onCancel} />
        </div>
        <iframe
          ref={iframeRef}
          src={livePreviewUrl ?? undefined}
          className="hidden max-h-[88vh] flex-1 rounded-md border xl:block"
          title="Live Preview"
        ></iframe>
      </div>
    </FormProvider>
  );
};

export default PortfolioEditor;
