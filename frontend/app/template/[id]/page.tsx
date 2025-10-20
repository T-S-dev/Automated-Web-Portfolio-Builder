import { notFound } from "next/navigation";

import ExamplePortfolio from "@/lib/ExamplePortfolio";
import { TemplateMappings } from "@/lib/TemplateMappings";

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
