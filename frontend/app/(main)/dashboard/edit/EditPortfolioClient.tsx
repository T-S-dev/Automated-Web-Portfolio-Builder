"use client";

import { useRouter } from "next/navigation";

import PortfolioEditor from "@/features/portfolio/components/PortfolioEditor";

import { Portfolio } from "@/types";

const EditPortfolioClient = ({ portfolio }: { portfolio: Portfolio }) => {
  const router = useRouter();

  return <PortfolioEditor className="p-4 pb-0" portfolio={portfolio} mode="edit" onCancel={() => router.push("/dashboard")} />;
};

export default EditPortfolioClient;
