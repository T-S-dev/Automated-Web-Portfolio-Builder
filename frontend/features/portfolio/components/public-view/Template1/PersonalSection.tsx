import { Github, Linkedin, LucideIcon, Mail, MapPin, Phone } from "lucide-react";

import { Portfolio } from "@/types";

const PersonalSection = ({ personal }: { personal: Portfolio["personal"] }) => {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="bg-gradient-to-r from-[#64ffda] to-[#22d652] bg-clip-text p-4 text-4xl font-bold text-transparent sm:text-6xl md:text-7xl">
        Hi,
        <br />
        I&apos;m {personal?.name},
        <br />a {personal?.job_title}.
      </h1>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {personal?.github && <SocialIcon href={personal.github} Icon={Github} />}
        {personal?.linkedin && <SocialIcon href={personal.linkedin} Icon={Linkedin} />}
        {personal?.email && <SocialIcon href={`mailto:${personal.email}`} Icon={Mail} />}
        {personal?.phone && <SocialIcon href={`tel:${personal.phone}`} Icon={Phone} />}
        {personal?.location && (
          <div className="flex items-center gap-1">
            <MapPin size={28} aria-hidden="true" />
            <span className="text-sm">{personal.location}</span>
          </div>
        )}
      </div>
    </section>
  );
};

type SocialIconProps = {
  href: string;
  text?: string;
  Icon: LucideIcon;
};

const SocialIcon = ({ href, text, Icon }: SocialIconProps) => (
  <a
    href={href || "#"}
    target={href ? "_blank" : ""}
    rel="noopener noreferrer"
    className="flex items-center gap-2 transition duration-300 hover:text-[#64ffda]"
  >
    <Icon size={28} aria-hidden="true" />
    {text && <span className="hidden sm:block">{text}</span>}
  </a>
);

export default PersonalSection;
