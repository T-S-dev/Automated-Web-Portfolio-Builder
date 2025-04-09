"use client";

import { useEffect, useRef, useState } from "react";

import PortfolioForm from "@/components/PortfolioForm";

const PortfolioEditor = ({ portfolio, mode, onCancel }) => {
  const iframeRef = useRef(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState(null);
  const [portfolioData, setPortfolioData] = useState(portfolio);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLivePreviewUrl(window.location.origin + "/live-preview");
    }
  }, []);

  useEffect(() => {
    const sendDataToIframe = () => {
      if (iframeRef.current && portfolioData) {
        iframeRef.current.contentWindow.postMessage({ portfolioData }, livePreviewUrl);
      }
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener("load", () => {
        sendDataToIframe();
      });
    }

    sendDataToIframe();
  }, [portfolioData, iframeRef.current]);

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
