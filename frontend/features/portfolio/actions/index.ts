"use server";

import { revalidatePath } from "next/cache";
import axios, { isAxiosError } from "axios";
import { currentUser } from "@clerk/nextjs/server";
import OpenAI, { APIError } from "openai";
import sanitizeHtml from "sanitize-html";

import { AppError } from "@/shared/lib/errors";
import { PortfolioSchema } from "@/shared/lib/Zod/portfolioSchema";
import { sanitizeOptions } from "@/shared/lib/utils"; 
import * as portfolioService from "@/features/portfolio/services";

import { Action } from "@/types/actions";
import { ParsedResume, Portfolio } from "@/types";

export async function parseResumeAction(formData: FormData): Action<ParsedResume> {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file uploaded or invalid file format" };
  }

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Please upload a PDF or DOCX file" };
  }

  const flaskApiUrl = process.env.FLASK_API_URL;
  if (!flaskApiUrl) {
    return { success: false, error: "Server configuration error: FLASK_API_URL is not set." };
  }

  try {
    const response = await axios.post(`${flaskApiUrl}/parse-resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { success: true, data: response.data };
  } catch (error) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.error || "Error communicating with the parsing service.";
      return { success: false, error: message };
    }
    return { success: false, error: "An unexpected server error occurred." };
  }
}

export async function createOrUpdatePortfolioAction(data: Portfolio): Action<{}> {
  try {
    const user = await currentUser();
    if (!user?.id || !user.username) {
      return { success: false, error: "User not authenticated or username missing" };
    }

    const validation = PortfolioSchema.safeParse({
      ...data,
      clerkId: user.id,
      username: user.username,
    });

    if (!validation.success) {
      return { success: false, error: "Invalid portfolio data provided." };
    }

    await portfolioService.createOrUpdatePortfolio(user.id, user.username, validation.data);

    revalidatePath("/dashboard");
    revalidatePath(`/portfolio/${user.username}`);

    return { success: true, data: {} };
  } catch (error) {
    const message = error instanceof AppError ? error.message : "An unexpected database error occurred.";
    return { success: false, error: message };
  }
}

export async function deletePortfolioAction(): Action<{}> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    await portfolioService.deletePortfolio(user.id);

    revalidatePath("/dashboard");
    revalidatePath(`/portfolio/${user.username}`);
    return { success: true, data: {} };
  } catch (error) {
    const message = error instanceof AppError ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function togglePrivacyAction(is_private: boolean): Action<{ is_private: boolean }> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    const updatedPortfolio = await portfolioService.updatePortfolioPrivacy(user.id, is_private);

    revalidatePath("/dashboard");
    revalidatePath(`/portfolio/${user.username}`);
    return { success: true, data: { is_private: updatedPortfolio.is_private } };
  } catch (error) {
    const message = error instanceof AppError ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

const client = new OpenAI();

const validAiSections = ["professional_summary", "experience_description", "project_description"] as const;
type ValidAiSection = (typeof validAiSections)[number];

type AiEnhancePayload = {
  section: ValidAiSection;
  text: string;
};

export async function aiEnhanceAction(payload: AiEnhancePayload): Action<{ text: string }> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { section, text } = payload;
    if (!validAiSections.includes(section) || typeof text !== "string") {
      return { success: false, error: "Invalid request payload" };
    }

    if (text.trim() === "") {
      return { success: true, data: { text: "" } };
    }

    const prompts = {
      professional_summary: `Rewrite this professional summary to be concise, achievement-oriented, and use active language. Return only the rewritten text:\n\n"${text}"`,
      experience_description: `Turn this experience description into 2-4 bullet points emphasizing action verbs and metrics. Return only the bullet points, one per line:\n\n"${text}"`,
      project_description: `Polish this project description into a few clear sentences focusing on the problem, solution, and impact. Return only the polished text:\n\n"${text}"`,
    };

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts[section] }],
      temperature: 0.5,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      return { success: false, error: "AI response was empty." };
    }

    const sanitizedResult = sanitizeHtml(result.trim(), sanitizeOptions);

    return { success: true, data: { text: sanitizedResult } };
  } catch (error: unknown) {
    console.error("AI Enhance Action Error:", error);
    if (error instanceof APIError) {
      return { success: false, error: error.message || "Failed to get response from AI." };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
