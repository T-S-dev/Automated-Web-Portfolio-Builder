"use client";

import { useRouter } from "next/navigation";

import PortfolioEditor from "@/components/PortfolioEditor";

import { Portfolio } from "@/types";

const EditPortfolioClient = ({ portfolio }: { portfolio: Portfolio }) => {
  const router = useRouter();

  return <PortfolioEditor portfolio={portfolio} mode="edit" onCancel={() => router.push("/dashboard")} />;
};

export default EditPortfolioClient;
