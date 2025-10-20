import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { IOptions } from "sanitize-html";
import type { KeyboardEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleSelectKeyDown(e: KeyboardEvent<HTMLElement>) {
  const target = e.target as HTMLInputElement;
  if (e.key === "Backspace" && !target.value) {
    e.preventDefault();
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "N/A";

  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 3)
    .join("");
}

export function formatUrl(url: string | null | undefined): string {
  if (!url || url.trim() === "") {
    return "";
  }

  if (!url.toLowerCase().startsWith("http://") && !url.toLowerCase().startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export const sanitizeOptions: IOptions = {
  allowedTags: ["strong", "em", "u", "p", "span"],
  allowedAttributes: {
    span: ["style"],
  },
};
