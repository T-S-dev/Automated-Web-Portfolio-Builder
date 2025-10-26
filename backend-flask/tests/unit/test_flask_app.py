import io
import pytest
from unittest.mock import Mock
from app import app

from exceptions import InvalidFileTypeError, OpenAIFailureError
from services import ResumeData


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_resume_data():
    """Pytest fixture for a mock Pydantic ResumeData object."""
    # We create a mock that has a .model_dump() method
    mock_data = Mock(spec=ResumeData)
    mock_data.model_dump.return_value = {
        "personal": {"name": "John Doe"},
        "professional_summary": "Experienced developer."
    }
    return mock_data


def test_no_file_provided(client):
    """Test that a POST request without a file returns a 400 error."""
    response = client.post('/parse-resume')
    assert response.status_code == 400
    data = response.get_json()
    assert data.get("error") == "No file in the request"


def test_unsupported_file_type(client, monkeypatch):
    """Test that the API returns a 400 when the service raises InvalidFileTypeError."""
    # Mock the resume_parser to raise the exception we expect
    monkeypatch.setattr(
        "app.resume_parser",
        Mock(side_effect=InvalidFileTypeError("Unsupported file type."))
    )

    data = {"file": (io.BytesIO(b"dummy content"), "dummy.txt", "text/plain")}
    response = client.post('/parse-resume', data=data)

    assert response.status_code == 400
    data = response.get_json()
    assert data.get("error") == "Unsupported file type."


def test_resume_parser_ai_error(client, monkeypatch):
    """Test that the API returns a 503 when the service raises OpenAIFailureError."""
    monkeypatch.setattr(
        "app.resume_parser",
        Mock(side_effect=OpenAIFailureError("AI API is down."))
    )

    data = {"file": (io.BytesIO(b"dummy content"),
                     "resume.pdf", "application/pdf")}
    response = client.post('/parse-resume', data=data)

    assert response.status_code == 503
    json_data = response.get_json()
    assert json_data.get("error") == "AI API is down."


def test_resume_parser_unexpected_error(client, monkeypatch):
    """Test that the API returns a 500 for a generic Exception."""
    monkeypatch.setattr(
        "app.resume_parser",
        Mock(side_effect=Exception("Something totally unexpected broke."))
    )

    data = {"file": (io.BytesIO(b"dummy content"),
                     "resume.pdf", "application/pdf")}
    response = client.post('/parse-resume', data=data)

    assert response.status_code == 500
    json_data = response.get_json()
    assert json_data.get("error") == "An unexpected server error occurred"


def test_resume_parser_success(client, monkeypatch, mock_resume_data):
    """
    Test that a valid PDF file returns the expected structured JSON data.
    """
    # Mock resume_parser to return the Pydantic model
    monkeypatch.setattr("app.resume_parser", Mock(
        return_value=mock_resume_data))

    data = {"file": (io.BytesIO(b"dummy content"),
                     "resume.pdf", "application/pdf")}
    response = client.post('/parse-resume', data=data)

    assert response.status_code == 200
    json_data = response.get_json()

    # Assert that the JSON data matches what our mock's .model_dump() returned
    assert json_data == mock_resume_data.model_dump.return_value
