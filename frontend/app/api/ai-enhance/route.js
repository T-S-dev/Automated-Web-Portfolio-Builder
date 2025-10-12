import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI();

const SECTION_PROMPTS = {
  professional_summary: (text) =>
    `Rewrite this professional summary to be concise, achievement-oriented, and use active language:\n\n${text}`,
  experience_description: (text) =>
    `Turn this experience description into 2-4 bullet points emphasizing action verbs and metrics. Output plain text with one bullet per line:\n\n${text}`,
  project_description: (text) =>
    `Polish this project description into a few clear sentences focusing on problem, solution, and impact:\n\n${text}`,
};

export async function POST(req) {
  const { section, text } = await req.json();

  if (!SECTION_PROMPTS[section] || typeof text !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const prompt = SECTION_PROMPTS[section](text);
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0].message.content;
    return NextResponse.json({ text: result }, { status: 200 });
  } catch (error) {}
}
