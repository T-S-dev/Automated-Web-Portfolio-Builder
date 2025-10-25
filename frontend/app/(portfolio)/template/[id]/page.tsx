import { notFound } from "next/navigation";

import ExamplePortfolio from "@/shared/constants/ExamplePortfolio";
import { TemplateMappings } from "@/features/template/lib/TemplateMappings";

const TemplatePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const templateId = parseInt(id, 10);

  if (isNaN(templateId)) {
    return notFound();
  }

  const SelectedTemplate = TemplateMappings[templateId];

  if (!SelectedTemplate) {
    return notFound();
  }

  return <SelectedTemplate portfolio={ExamplePortfolio} />;
};

export default TemplatePage;
