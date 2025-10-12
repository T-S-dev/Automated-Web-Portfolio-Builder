"use client";

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { PortfolioSchema } from "@/lib/Zod/portfolioSchema";

import {
  TemplateList,
  PersonalSection,
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  ProfessionalSummarySection,
  ProjectsSection,
  SkillsSection,
} from "@/components/PortfolioForm/index";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { User, Briefcase, Wrench, Award, FileText, BookOpen, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const PortfolioForm = ({ portfolioData, setPortfolioData, onCancel, mode = "create" }) => {
  const router = useRouter();
  const { user } = useUser();

  const methods = useForm({
    resolver: zodResolver(PortfolioSchema),
    defaultValues: { ...portfolioData, template: portfolioData?.template || 1 },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const onSubmit = async (data) => {
    const toastId = toast.loading(mode === "create" ? "Creating portfolio..." : "Updating portfolio...");
    try {
      const endpoint = "/api/portfolio";
      const method = mode === "create" ? "post" : "put";

      await axios[method](endpoint, data);

      toast.success(mode === "create" ? "Portfolio created successfully!" : "Portfolio updated successfully!", {
        id: toastId,
      });

      if (mode === "create") {
        window.open("/portfolio/" + user.username, "_blank");
      }

      router.push("/dashboard");
    } catch (error) {
      toast.error("Error saving portfolio.", { id: toastId });
    }
  };

  useEffect(() => {
    const subscription = watch((updatedValues) => {
      setPortfolioData(updatedValues);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col">
        <TemplateList />

        <div className="flex w-full flex-1 flex-col rounded-md border bg-gray-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">{mode === "create" ? "Create" : "Edit"} Your Portfolio</h2>

          <Accordion type="multiple" defaultValue={["personal"]} className="w-full flex-1">
            <FormSection value="personal" title="Personal Information" icon={User}>
              <PersonalSection />
            </FormSection>

            <FormSection value="professional_summary" title="Professional Summary" icon={FileText}>
              <ProfessionalSummarySection />
            </FormSection>

            <FormSection value="education" title="Education" icon={BookOpen}>
              <EducationSection />
            </FormSection>

            <FormSection value="experience" title="Experience" icon={Briefcase}>
              <ExperienceSection />
            </FormSection>

            <FormSection value="skills" title="Skills" icon={Wrench}>
              <SkillsSection />
            </FormSection>

            <FormSection value="projects" title="Projects" icon={Folder}>
              <ProjectsSection />
            </FormSection>

            <FormSection value="certifications" title="Certifications" icon={Award}>
              <CertificationsSection />
            </FormSection>
          </Accordion>

          <div className="mt-6 flex space-x-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
            >
              {mode === "create" ? "Create Portfolio" : "Update Portfolio"}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

const FormSection = ({ value, title, icon: Icon, children }) => {
  const {
    formState: { errors },
  } = useFormContext();

  const hasError = !!errors[value];

  return (
    <AccordionItem value={value}>
      <AccordionTrigger>
        <div className="relative flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
          {hasError && <span className="absolute left-full ml-2 text-red-500">*</span>}
        </div>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
};

export default PortfolioForm;
