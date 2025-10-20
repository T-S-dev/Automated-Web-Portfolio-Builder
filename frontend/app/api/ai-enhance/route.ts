import { NextRequest, NextResponse } from "next/server";
import OpenAI, { APIError } from "openai";

const client = new OpenAI();

const validSections = ["professional_summary", "experience_description", "project_description"] as const;
type ValidSection = (typeof validSections)[number];

type AiEnhanceRequestBody = {
  section: ValidSection;
  text: string;
};

type SectionPrompts = Record<ValidSection, (text: string) => string>;

const SECTION_PROMPTS: SectionPrompts = {
  professional_summary: (text) =>
    `Rewrite this professional summary to be concise, achievement-oriented, and use active language. Return only the rewritten text:\n\n"${text}"`,
  experience_description: (text) =>
    `Turn this experience description into 2–4 bullet points emphasizing action verbs and metrics. Return only the bullet points, one per line:\n\n"${text}"`,
  project_description: (text) =>
    `Polish this project description into a few clear sentences focusing on the problem, solution, and impact. Return only the polished text:\n\n"${text}"`,
};

function isValidSection(section: any): section is ValidSection {
  return validSections.includes(section);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body.text !== "string" || !isValidSection(body.section)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { section, text } = body as AiEnhanceRequestBody;

    if (text.trim() === "") {
      return NextResponse.json({ text: "" }, { status: 200 });
    }

    const prompt = SECTION_PROMPTS[section](text);
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0]?.message?.content;

    if (!result) {
      throw new Error("AI response was empty.");
    }

    return NextResponse.json({ text: result.trim() }, { status: 200 });
  } catch (error) {
    console.error("AI Enhance API Error:", error);

    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message || "Failed to get response from AI." },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
