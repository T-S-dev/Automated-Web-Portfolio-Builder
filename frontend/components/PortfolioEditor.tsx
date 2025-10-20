"use client";

import { useEffect, useRef, useState } from "react";

import PortfolioForm from "@/components/PortfolioForm";

import { Portfolio } from "@/types";

type PortfolioEditorProps = {
  portfolio: Portfolio;
  mode: "create" | "edit";
  onCancel: () => void;
};

const PortfolioEditor = ({ portfolio, mode, onCancel }: PortfolioEditorProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(portfolio);
  const [iframeReady, setIframeReady] = useState<boolean>(false);

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
    if (iframeReady && iframeRef.current?.contentWindow && portfolioData && livePreviewUrl) {
      iframeRef.current.contentWindow.postMessage({ portfolioData }, livePreviewUrl);
    }
  }, [iframeReady, portfolioData, livePreviewUrl]);

  return (
    <div className="flex flex-1 gap-4 p-4">
      <PortfolioForm
        portfolioData={portfolioData}
        setPortfolioData={setPortfolioData}
        mode={mode}
        onCancel={onCancel}
      />
      <iframe
        ref={iframeRef}
        src={livePreviewUrl ?? undefined}
        className="hidden max-h-[88vh] min-w-[50%] flex-1 rounded-md border xl:block"
        title="Live Preview"
      ></iframe>
    </div>
  );
};

export default PortfolioEditor;
