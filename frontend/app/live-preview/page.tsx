"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import Loader from "@/components/Loader";

import { TemplateMappings, DefaultTemplate } from "@/lib/TemplateMappings";

import { Portfolio } from "@/types";

const LivePreview = () => {
  const [portfolio, setPortfolio] = useState<Partial<Portfolio> | null>(null);

  useEffect(() => {
    // If the page is not embedded, show a 404 page
    if (window.top === window.self) {
      return notFound();
    }

    window.parent.postMessage({ status: "ready" }, "*");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.portfolioData) {
        setPortfolio(event.data.portfolioData);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!portfolio || !portfolio.template) return <Loader />;

  const SelectedTemplate = TemplateMappings[portfolio.template] || DefaultTemplate;

  return <SelectedTemplate portfolio={portfolio as Portfolio} />;
};

export default LivePreview;
