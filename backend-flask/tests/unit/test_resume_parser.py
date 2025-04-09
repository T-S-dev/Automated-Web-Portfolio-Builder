import io
import json
import os
import tempfile
from resume_parser import extract_text_from_pdf, extract_text_from_docx, extract_text, resume_parser
from werkzeug.datastructures import FileStorage
from pathlib import Path


def get_fixture_resume_path(filename):
    """Helper using pathlib to locate fixture resumes."""
    return str(Path(__file__).parent.parent / "fixtures" / "resumes" / filename)


PDF_PATH = get_fixture_resume_path("resume.pdf")
DOCX_PATH = get_fixture_resume_path("resume.docx")


class MockResponse:
    def __init__(self, content):
        self.choices = [self]
        self.message = self
        self.content = content


class MockOpenAIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.beta = self
        self.chat = self
        self.completions = self

    def parse(self, model, messages, response_format):
        # Create a dummy structured resume data.
        dummy_data = {
            "personal": {
                "name": "John Doe",
                "job_title": "Software Developer",
                "email": "john.doe@example.com",
                "phone": "123-456-7890",
                "linkedin": "linkedin.com/in/johndoe",
                "github": "github.com/johndoe",
                "location": "London"
            },
            "professional_summary": "Experienced developer.",
            "education": [],
            "experience": [],
            "skills": {"technical": ["Python", "Flask"], "soft": ["Communication"]},
            "projects": [],
            "certifications": []
        }
        json_str = json.dumps(dummy_data)
        return MockResponse(json_str)


def assert_resume_text_valid(text):
    assert isinstance(text, str), "Text should be a string"
    assert len(text) > 0, "Extracted text should not be empty"
    assert "John Doe" in text, "Text should contain the name 'John Doe'"
    assert "Software Engineer" in text, "Text should contain 'Software Engineer'"
    assert "john.doe@example.com" in text, "Text should contain 'john.doe@example.com'"
    assert "Bachelor of Science in Computer Science" in text, "Text should contain 'Bachelor of Science in Computer Science'"
    assert "XYZ University" in text, "Text should contain 'XYZ University'"
    assert "Databases: PostgreSQL, MongoDB, Firebase" in text, "Text should contain 'Databases: PostgreSQL, MongoDB, Firebase'"
    assert "Real-Time Chat Application" in text, "Text should contain 'Real-Time Chat Application'"
    assert "AWS Certified Solutions Architect - Associate (2022)" in text, "Text should contain 'AWS Certified Solutions Architect - Associate (2022)'"


def test_extract_text_from_pdf():
    """Test extract_text on a PDF file wrapped in a FileStorage object."""
    with open(PDF_PATH, "rb") as f:
        fs = FileStorage(stream=f, filename="resume.pdf",
                         content_type="application/pdf")
        text = extract_text_from_pdf(fs)

    assert_resume_text_valid(text)


def test_extract_text_from_docx():
    """Test extract_text on a DOCX file wrapped in a FileStorage object."""
    with open(DOCX_PATH, "rb") as f:
        fs = FileStorage(
            stream=f,
            filename="resume.docx",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        text = extract_text_from_docx(fs)

    assert_resume_text_valid(text)


def test_extract_text_no_mimetype():
    """Test that extract_text returns an error when the file object has no mimetype attribute."""
    with open(PDF_PATH, "rb") as f:
        result = extract_text(f)
    assert result == {"error": "File object has no mimetype attribute."}


def test_extract_text_pdf():
    """Test extract_text on a PDF file wrapped in a FileStorage object."""
    with open(PDF_PATH, "rb") as f:
        fs = FileStorage(stream=f, filename="resume.pdf",
                         content_type="application/pdf")
        text = extract_text(fs)

    assert_resume_text_valid(text)


def test_extract_text_docx():
    """Test extract_text on a DOCX file wrapped in a FileStorage object."""
    with open(DOCX_PATH, "rb") as f:
        fs = FileStorage(
            stream=f,
            filename="resume.docx",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        text = extract_text(fs)

    assert_resume_text_valid(text)


def test_extract_text_unsupported_file():
    """Test extract_text returns an error for an unsupported file type."""
    # Create a temporary file with an unsupported mimetype
    with tempfile.NamedTemporaryFile("wb", delete=False) as tmp:
        tmp.write(b"Unsupported")
        tmp_filename = tmp.name

    with open(tmp_filename, "rb") as f:
        fs = FileStorage(stream=f, filename="unsupported.txt",
                         content_type="text/plain")
        result = extract_text(fs)
    os.remove(tmp_filename)
    assert result == {
        "error": "Unsupported file type. Please upload a PDF or DOCX file."}


def test_resume_parser(monkeypatch):
    """
    Test that resume_parser returns the expected structured data.
    """

    monkeypatch.setattr("resume_parser.extract_text",
                        lambda file: "Resume text")

    monkeypatch.setattr("resume_parser.OpenAI", MockOpenAIClient)

    dummy_file = io.BytesIO(b"dummy content")
    dummy_file.mimetype = "application/pdf"

    result = resume_parser(dummy_file)

    expected_data = {
        "personal": {
            "name": "John Doe",
            "job_title": "Software Developer",
            "email": "john.doe@example.com",
            "phone": "123-456-7890",
            "linkedin": "linkedin.com/in/johndoe",
            "github": "github.com/johndoe",
            "location": "London"
        },
        "professional_summary": "Experienced developer.",
        "education": [],
        "experience": [],
        "skills": {"technical": ["Python", "Flask"], "soft": ["Communication"]},
        "projects": [],
        "certifications": []
    }

    assert result == expected_data
