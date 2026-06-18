import re

"""
PDF processing module for parsing and cleaning text from PDF files.
"""

def clean_word(word: str) -> str:
    """
    Lowercase and remove non-alphanumeric characters from a word.

    Args:
        word: The raw word string.

    Returns:
        The cleaned word string.
    """
    return re.sub(r'[^a-zA-Z0-9]', '', word).lower()
