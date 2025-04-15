"use client";

import { useEffect, useRef, useState } from "react";

import PortfolioForm from "@/components/PortfolioForm";

const PortfolioEditor = ({ portfolio, mode, onCancel }) => {
  const iframeRef = useRef(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState(null);
  const [portfolioData, setPortfolioData] = useState(portfolio);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLivePreviewUrl(window.location.origin + "/live-preview");
    }

    const handleIframeReady = (event) => {
      if (event.data?.status === "ready") {
        setIframeReady(true);
      }
    };

    window.addEventListener("message", handleIframeReady);
    return () => window.removeEventListener("message", handleIframeReady);
  }, []);

  useEffect(() => {
    if (iframeReady && iframeRef.current && portfolioData && livePreviewUrl) {
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
        src={livePreviewUrl}
        className="hidden max-h-[88vh] min-w-[50%] flex-1 rounded-md border xl:block"
        title="Live Preview"
      ></iframe>
    </div>
  );
};

export default PortfolioEditor;
