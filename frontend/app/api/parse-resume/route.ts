import { NextRequest, NextResponse } from "next/server";
import axios, { isAxiosError } from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded or invalid file format" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or DOCX file" }, { status: 400 });
    }

    const flaskApiUrl = process.env.FLASK_API_URL;
    if (!flaskApiUrl) {
      throw new Error("FLASK_API_URL is not defined in environment variables.");
    }

    const response = await axios.post(`${flaskApiUrl}/parse-resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    console.error("Error processing resume:", error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.error || "Error communicating with the parsing service." },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
