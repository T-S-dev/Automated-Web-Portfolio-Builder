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
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from werkzeug.datastructures import FileStorage

from exceptions import ParsingError, InvalidFileTypeError, EmptyFileError, OpenAIFailureError

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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


def _extract_text_from_pdf(file: FileStorage) -> str:
    """
    Extract text from a PDF file.

    This function reads a PDF file from a `FileStorage` object and returns
    all non-empty text from each page as a single string separated by newline characters.

    Args:
        file (FileStorage): A file-like object representing the uploaded PDF file.

    Returns:
        str: The extracted text from the PDF file.

    Raises:
        EmptyFileError: If the PDF file contains no text.
        InvalidFileTypeError: If the file is not a valid PDF or is corrupt.
    """
    try:
        file.seek(0)
        with pdfplumber.open(file) as pdf:
            text = '\n'.join(page.extract_text()
                             for page in pdf.pages if page.extract_text())
        if not text.strip():
            raise EmptyFileError(
                "PDF file is empty or text could not be extracted.")
        return text
    except Exception as e:
        raise InvalidFileTypeError("Invalid or corrupt PDF file.") from e


def _extract_text_from_docx(file: FileStorage) -> str:
    """
    Extract text from a DOCX file.

    This function reads a DOCX file from a `FileStorage` object and returns
    all non-empty paragraphs as a single string separated by newline characters.

    Parameters:
        file (FileStorage): A file-like object representing the uploaded DOCX file.

    Returns:
        str: The extracted text from the DOCX file.

    Raises:
        EmptyFileError: If the DOCX file contains no text or only empty paragraphs.
        InvalidFileTypeError: If the file is not a valid DOCX or is corrupt.

    """
    try:
        file.seek(0)
        doc = Document(file)
        text = '\n'.join(para.text for para in doc.paragraphs if para.text)
        if not text.strip():
            raise EmptyFileError(
                "DOCX file is empty or text could not be extracted.")
        return text
    except Exception as e:
        raise InvalidFileTypeError("Invalid or corrupt DOCX file.") from e


def _extract_text(file: FileStorage) -> str:
    """
    Determines file type and extracts text accordingly.

    This function checks the file's mimetype and delegates the text
    extraction to the appropriate specialized function (_extract_text_from_pdf
    or _extract_text_from_docx).

    Args:
        file (FileStorage): The uploaded file object to process.

    Returns:
        str: The extracted text from the file.

    Raises:
        ParsingError: If the file object is invalid (e.g., no mimetype).
        InvalidFileTypeError: If the file mimetype is not one of the
                            supported types (PDF or DOCX).
        EmptyFileError: If the file is valid but contains no text.
    """
    if not hasattr(file, "mimetype"):
        raise ParsingError("File object has no mimetype attribute.")

    if file.mimetype == "application/pdf":
        return _extract_text_from_pdf(file)
    elif file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_text_from_docx(file)
    else:
        raise InvalidFileTypeError(
            "Unsupported file type. Please upload a PDF or DOCX file.")


# ==============================
# AI-Powered Resume Parsing
# ==============================


def resume_parser(file: FileStorage) -> ResumeData:
    """
    Parses resume text using OpenAI GPT-4o-mini to extract structured information.

    This is the main service function that orchestrates text extraction
    and AI-powered parsing. 

    Args:
        file (FileStorage): The uploaded resume file (PDF or DOCX).

    Returns:
        ResumeData: A Pydantic model (defined in this module) containing
                    the structured resume data.

    Raises:
        InvalidFileTypeError: If the file is not a valid PDF or DOCX, or is corrupt.
        EmptyFileError: If the file is valid but contains no extractable text.
        ParsingError: If the file object is invalid (e.g., missing mimetype).
        OpenAIFailureError: If the OpenAI API call fails, times out, or
                            returns data that does not match the ResumeData model.
    """

    try:
        text = _extract_text(file)

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

        parsed_data = response.choices[0].message.parsed

        if not parsed_data:
            raise OpenAIFailureError("AI returned an empty response.")

        return parsed_data

    except (InvalidFileTypeError, EmptyFileError, ParsingError) as e:
        raise e
    except ValidationError as e:
        raise OpenAIFailureError(f"AI returned invalid data structure: {e}")
    except Exception as e:
        raise OpenAIFailureError(f"Error communicating with AI service: {e}")


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
