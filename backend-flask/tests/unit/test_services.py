import pytest
from unittest.mock import Mock
from pydantic import ValidationError
from werkzeug.datastructures import FileStorage
from pathlib import Path

from services import resume_parser, ResumeData, Personal, Skills
from exceptions import InvalidFileTypeError, EmptyFileError, OpenAIFailureError


def get_fixture_resume_path(filename):
    """Helper using pathlib to locate fixture resumes."""
    return str(Path(__file__).parent.parent / "fixtures" / "resumes" / filename)


@pytest.fixture
def pdf_file():
    """A pytest fixture for a valid PDF FileStorage object."""
    path = get_fixture_resume_path("resume.pdf")
    with open(path, "rb") as f:
        yield FileStorage(stream=f, filename="resume.pdf", content_type="application/pdf")


@pytest.fixture
def txt_file():
    """A pytest fixture for an unsupported TXT FileStorage object."""
    path = get_fixture_resume_path(
        "resume.docx")
    with open(path, "rb") as f:
        yield FileStorage(stream=f, filename="unsupported.txt", content_type="text/plain")


@pytest.fixture
def mock_openai_response():
    """A mock Pydantic model returned by the OpenAI .parse() method."""
    return ResumeData(
        personal=Personal(name="John Doe"),
        professional_summary="Experienced developer.",
        skills=Skills(technical=["Python"], soft=["Communication"])
    )


def test_resume_parser_success(monkeypatch, pdf_file, mock_openai_response):
    """
    Test the "happy path" - a successful resume parse.
    We mock the text extraction and the AI call.
    """
    mock_extract = Mock(return_value="Full resume text")
    monkeypatch.setattr("services._extract_text", mock_extract)

    mock_parse = Mock(return_value=Mock(
        choices=[Mock(message=Mock(parsed=mock_openai_response))]))
    monkeypatch.setattr(
        "services.client.beta.chat.completions.parse", mock_parse)

    result = resume_parser(pdf_file)

    assert result == mock_openai_response
    mock_extract.assert_called_with(pdf_file)
    mock_parse.assert_called_once()


def test_resume_parser_unsupported_file_type(txt_file):
    """
    Test that resume_parser raises InvalidFileTypeError for a .txt file.
    This tests the _extract_text function's validation.
    """
    with pytest.raises(InvalidFileTypeError) as e:
        resume_parser(txt_file)

    assert "Unsupported file type" in str(e.value)


def test_resume_parser_empty_file(monkeypatch, pdf_file):
    """
    Test that resume_parser raises EmptyFileError if the text extraction returns nothing.
    """
    mock_extract = Mock(side_effect=EmptyFileError("File is empty"))
    monkeypatch.setattr("services._extract_text", mock_extract)

    with pytest.raises(EmptyFileError) as e:
        resume_parser(pdf_file)

    assert "File is empty" in str(e.value)


def test_resume_parser_ai_failure(monkeypatch, pdf_file):
    """
    Test that resume_parser raises OpenAIFailureError if the AI call fails.
    """
    mock_extract = Mock(return_value="Full resume text")
    monkeypatch.setattr("services._extract_text", mock_extract)

    # Mock the AI call to raise a generic Exception
    mock_parse = Mock(side_effect=Exception("AI API is down"))
    monkeypatch.setattr(
        "services.client.beta.chat.completions.parse", mock_parse)

    with pytest.raises(OpenAIFailureError) as e:
        resume_parser(pdf_file)

    assert "Error communicating with AI service" in str(e.value)
    # Check that the original error is chained
    assert "AI API is down" in str(e.value)


def test_resume_parser_ai_invalid_data(monkeypatch, pdf_file):
    """
    Test that resume_parser raises OpenAIFailureError if the AI returns malformed data.
    """
    mock_extract = Mock(return_value="Full resume text")
    monkeypatch.setattr("services._extract_text", mock_extract)

    # Mock the AI call to raise a Pydantic ValidationError
    mock_parse = Mock(side_effect=ValidationError.from_exception_data(
        title="Test", line_errors=[]))
    monkeypatch.setattr(
        "services.client.beta.chat.completions.parse", mock_parse)

    with pytest.raises(OpenAIFailureError) as e:
        resume_parser(pdf_file)

    assert "AI returned invalid data structure" in str(e.value)
