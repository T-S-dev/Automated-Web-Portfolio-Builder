"""
Flask API for parsing resumes.

This API accepts a PDF or DOCX resume file, processes it using 'resume_parser',
and returns structured resume data as JSON.

"""
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_parser import resume_parser

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
     r"/*": {"origins": ["http://localhost:3000", os.getenv("FRONTEND_URL")]}})


@app.route('/parse-resume', methods=['POST'])
def parse_resume_endpoint():
    """
    API endpoint to process resume file.

    Expects:
        - A POST request with a file.

    Returns:
        - JSON response containing parsed resume data if successful.
        - Error message with HTTP 400 or 500 if file is missing or invalid.
    """

    if 'file' not in request.files:
        return jsonify({"error": "No file in the request"}), 400

    file = request.files['file']

    # Validate file type (only allow PDF and DOCX)
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.mimetype not in allowed_types:
        return jsonify({"error": "Unsupported file type. Please upload a PDF or DOCX file."}), 400

    if file:
        parsed_data = resume_parser(file)

        # Handle any errors from the parser
        if isinstance(parsed_data, dict) and "error" in parsed_data:
            if parsed_data["error"] == "Invalid PDF file" or parsed_data["error"] == "Invalid DOCX file":
                return jsonify(parsed_data), 400
            else:
                return jsonify(parsed_data), 500

        return jsonify(parsed_data), 200

    return jsonify({"error": "Unable to parse resume"}), 500


if __name__ == '__main__':
    app.run()
