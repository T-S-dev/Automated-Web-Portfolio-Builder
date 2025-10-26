from pathlib import Path
import pytest
from app import app


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def get_fixture_resume_path(filename):
    """Helper using pathlib to locate fixture resumes."""
    return str(Path(__file__).parent.parent / "fixtures" / "resumes" / filename)


@pytest.mark.e2e
def test_end_to_end_resume_parsing(client):
    """
    Integration test: Sends an actual resume file to the /parse-resume endpoint,
    and verifies that the complete workflow (including a live AI call) 
    returns the expected JSON structure.
    """
    resume_path = get_fixture_resume_path("resume.pdf")

    with open(resume_path, "rb") as f:
        data = {
            'file': (f, 'resume.pdf', 'application/pdf')
        }
        response = client.post(
            "/parse-resume",
            data=data,
            content_type='multipart/form-data'
        )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.data}"

    parsed_data = response.get_json()
    expected_keys = [
        "personal", "professional_summary", "education",
        "experience", "skills", "projects", "certifications"
    ]

    assert parsed_data is not None, "Response was not valid JSON."
    for key in expected_keys:
        assert key in parsed_data, f"Expected key '{key}' in response."

    # assert the AI actually returned some data
    assert parsed_data["personal"]["name"] is not None, "AI did not return a name."
