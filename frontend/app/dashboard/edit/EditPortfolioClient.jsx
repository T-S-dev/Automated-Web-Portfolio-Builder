"use client";

import { useRouter } from "next/navigation";

import PortfolioEditor from "@/components/PortfolioEditor";

const EditPortfolioClient = ({ portfolio }) => {
  const router = useRouter();

  return <PortfolioEditor portfolio={portfolio} mode="edit" onCancel={() => router.push("/dashboard")} />;
};

export default EditPortfolioClient;
