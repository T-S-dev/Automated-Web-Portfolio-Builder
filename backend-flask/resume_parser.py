"""
Resume Parser using OpenAI and Pydantic models.

This script extracts text from PDF or DOCX resumes, processes the extracted text using GPT-4o-mini,
and returns structured JSON data containing personal details, summary, education, work experience, skills, projects, and certifications.

"""

import os
import pdfplumber
import json
from docx import Document
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from typing import List, Optional
from werkzeug.datastructures import FileStorage

load_dotenv()

# ==============================
# Pydantic Data Models
# ==============================


class Personal(BaseModel):
    """Represents personal details in a resume."""
    name: Optional[str] = None
    job_title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None


class Education(BaseModel):
    """Represents education details in a resume."""
    degree: Optional[str] = None
    institution: Optional[str] = None
    grade: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Experience(BaseModel):
    """Represents work experience in a resume."""
    job_title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class Skills(BaseModel):
    """Represents both technical and soft skills from a resume."""
    technical: Optional[List[str]] = None
    soft: Optional[List[str]] = None


class Project(BaseModel):
    """Represents project details in a resume."""
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    url: Optional[str] = None
    repo: Optional[str] = None


class Certification(BaseModel):
    """Represents certifications in a resume."""
    name: Optional[str] = None
    issued_by: Optional[str] = None
    date: Optional[str] = None


class ResumeData(BaseModel):
    """Represents the full structured resume data model."""
    personal: Optional[Personal] = None
    professional_summary: Optional[str] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    skills: Optional[Skills] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None

# ==============================
# Resume Text Extraction Functions
# ==============================


def extract_text_from_pdf(file):
    """
    Extracts text from a PDF resume.

    Args:
        file (FileStorage): PDF file object.

    Returns:
        str: Extracted text from the PDF.   
        dict: Error message if parsing fails.
    """
    try:
        with pdfplumber.open(file) as pdf:
            text = '\n'.join(page.extract_text() for page in pdf.pages)
        return text
    except Exception as e:
        error_message = str(e)
        if "Is this really a PDF?" in error_message:
            return {"error": "Invalid PDF file"}
        else:
            return {"error": "Unable to extract text from PDF"}


def extract_text_from_docx(file):
    """
    Extracts text from a DOCX resume.

    Args:
        file (FileStorage): DOCX file object.

    Returns:
        str: Extracted text from the DOCX file.
        dict: Error message if parsing fails.
    """
    try:
        doc = Document(file)
        text = '\n'.join(para.text for para in doc.paragraphs)
        return text
    except Exception as e:
        error_message = str(e)

        if "File is not a zip file" in error_message:
            return {"error": "Invalid DOCX file"}
        else:
            return {"error": "Unable to extract text from DOCX"}


def extract_text(file):
    """
    Determines file type and extracts text accordingly.

    Args:
        file (FileStorage): Uploaded resume file.

    Returns:
        str: Extracted text from the file.
        dict: Error message for unsupported formats.
    """

    try:
        # Flask FileStorage object has a mimetype attribute
        if hasattr(file, "mimetype"):
            mimetype = file.mimetype
        else:
            return {"error": "File object has no mimetype attribute."}

        if mimetype == "application/pdf":
            return extract_text_from_pdf(file)
        elif mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return extract_text_from_docx(file)
        else:
            return {"error": "Unsupported file type. Please upload a PDF or DOCX file."}

    except Exception:
        return {"error": "Unexpected error processing file."}

# ==============================
# AI-Powered Resume Parsing
# ==============================


def resume_parser(file):
    """
    Parses resume text using OpenAI GPT-4o to extract structured information.

    Args:
        file (FileStorage): Uploaded resume file.

    Returns:
        dict: Parsed structured resume data.
    """
    text = extract_text(file)

    # Handle error from text extraction
    if isinstance(text, dict) and "error" in text:
        return text

    try:

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        prompt = '''
        You are an AI resume parser. Extract the following details from the given resume text:
        
        1. Personal details (name, job title, email, phone, linkedin, github, location)
        2. Professional summary
        3. Education (degree, institution, grade, start_date, end_date)
        4. Work Experience (job title, company, start date, end date, description)
        5. Skills (technical and soft)
        6. Projects (name, description, technologies, url, repo)
        7. Certifications (name, issued_by, date)
        
        If any field is missing in the resume, return it as null or an empty list.
        '''

        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": text}
            ],
            response_format=ResumeData,  # Enforce structured response
        )

        json_string = response.choices[0].message.content
        parsed_data = json.loads(json_string)

        return parsed_data

    except Exception:
        return {"error": "Error parsing resume."}


if __name__ == "__main__":
    """
    Runs a test to parse a resume file when executed as a script.

    This block allows testing by loading a sample resume and saving the parsed output to a JSON file.
    """
    with open("resumes/resume.pdf", 'rb') as file:
        file = FileStorage(file, content_type="application/pdf")

        resume_data = resume_parser(file)
        with open("parsed_data.json", 'w') as f:
            json.dump(resume_data, f, indent=4)
