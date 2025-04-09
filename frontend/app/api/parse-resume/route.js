import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (
      file.type !== "application/pdf" &&
      file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or DOCX file" }, { status: 400 });
    }

    const response = await axios.post(`${process.env.FLASK_API_URL}/parse-resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json({ error: error.response?.data?.error || "Error processing resume" }, { status: 500 });
  }
}