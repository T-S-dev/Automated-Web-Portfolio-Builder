import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services import resume_parser
from exceptions import ParsingError, InvalidFileTypeError, EmptyFileError, OpenAIFailureError

load_dotenv()

app = Flask(__name__)

CORS_ORIGINS = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

CORS(app, resources={
    r"/parse-resume": {"origins": CORS_ORIGINS.split(',')}
})


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

    try:
        parsed_data = resume_parser(file)

        return jsonify(parsed_data.model_dump()), 200

    except (InvalidFileTypeError, EmptyFileError) as e:
        # 400 Bad Request for file-related issues
        return jsonify({"error": str(e)}), 400
    except OpenAIFailureError as e:
        # 503 Service Unavailable for AI failures
        return jsonify({"error": str(e)}), 503
    except ParsingError as e:
        # 422 Unprocessable Entity for general parsing errors
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        # General catch-all for any other unexpected errors
        app.logger.error(f"Unexpected error: {e}")  # Log the full error
        return jsonify({"error": "An unexpected server error occurred"}), 500


if __name__ == '__main__':
    app.run(debug=True)
