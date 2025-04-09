import io
import json
import pytest
from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_no_file_provided(client):
    """Test that a POST request without a file returns a 400 error."""
    response = client.post('/parse-resume')
    assert response.status_code == 400
    data = response.get_json()
    assert data.get("error") == "No file in the request"


def test_unsupported_file_type(client):
    """Test that uploading a file with an unsupported mimetype returns a 400 error."""
    data = {
        "file": (io.BytesIO(b"dummy content"), "dummy.txt", "text/plain")
    }
    response = client.post('/parse-resume', data=data)
    assert response.status_code == 400
    data = response.get_json()
    assert data.get(
        "error") == "Unsupported file type. Please upload a PDF or DOCX file."


def test_resume_parser_error(client, monkeypatch):
    """
    Test that when resume_parser returns an error dict, the API returns a 500 status.
    """
    monkeypatch.setattr("app.resume_parser", lambda file: {
                        "error": "Error parsing resume."})

    data = {
        "file": (io.BytesIO(b"dummy content"), "resume.pdf", "application/pdf")
    }
    response = client.post('/parse-resume', data=data)
    assert response.status_code == 500
    json_data = response.get_json()
    assert json_data.get("error") == "Error parsing resume."


def test_resume_parser_success(client, monkeypatch):
    """
    Test that a valid PDF file returns the expected structured JSON data.
    """
    dummy_result = {
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

    monkeypatch.setattr("app.resume_parser", lambda file: dummy_result)

    data = {
        "file": (io.BytesIO(b"dummy content"), "resume.pdf", "application/pdf")
    }
    response = client.post('/parse-resume', data=data)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data == dummy_result
