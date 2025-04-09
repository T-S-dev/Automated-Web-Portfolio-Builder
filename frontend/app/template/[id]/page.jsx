import { notFound } from "next/navigation";

import ExamplePortfolio from "@/lib/ExamplePortfolio";
import { TemplateMappings } from "@/lib/TemplateMappings";

const TemplatePage = async ({ params }) => {
  const { id } = await params;

  const SelectedTemplate = TemplateMappings[id];

  if (!SelectedTemplate) {
    return notFound();
  }

  return <SelectedTemplate portfolio={ExamplePortfolio} />;
};

export default TemplatePage;
