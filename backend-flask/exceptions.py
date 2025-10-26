"""
Defines custom exceptions for the application's service layer.
"""


class ParsingError(Exception):
    """Base exception for all parsing-related errors."""
    pass


class InvalidFileTypeError(ParsingError):
    """Raised when a file is not a PDF or DOCX."""
    pass


class EmptyFileError(ParsingError):
    """Raised when the file is empty or no text can be extracted."""
    pass


class OpenAIFailureError(ParsingError):
    """Raised when the OpenAI API call fails or returns invalid data."""
    pass
