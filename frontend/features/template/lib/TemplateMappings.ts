import Template1 from "@/features/portfolio/components/public-view/Template1";
import Template2 from "@/features/portfolio/components/public-view/Template2";

import { Portfolio } from "@/types";

type TemplateProps = {
  portfolio: Portfolio;
};

type TemplateMapping = Record<number, React.ComponentType<TemplateProps>>;

export const DefaultTemplate: React.ComponentType<TemplateProps> = Template1;

export const TemplateMappings: TemplateMapping = {
  1: Template1,
  2: Template2,
};
