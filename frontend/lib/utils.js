import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function handleSelectKeyDown(e) {
  if (e.key === "Backspace" && !e.target.value) {
    e.preventDefault();
  }
}

export function getInitials(name) {
  if (!name) return "N/A";

  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 3)
    .join("");
}

export function formatUrl(url) {
  if (!url || url.trim() === "") {
    return "";
  }

  if (!url.toLowerCase().startsWith("http://") && !url.toLowerCase().startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export const sanitizeOptions = {
  allowedTags: ["strong", "em", "u", "p", "span"],
  allowedAttributes: {
    span: ["style"],
  },
};
