import os

LANGUAGE_EXTENSIONS = {
    ".py"  : "python",
    ".js"  : "javascript",
    ".jsx" : "javascript",
    ".ts"  : "javascript",
    ".tsx" : "javascript",
    ".mjs" : "javascript",
}

SUPPORTED_LANGUAGES = ["python", "javascript"]


def detect_language(filename: str) -> str:
    """Detect language from file extension"""
    ext = os.path.splitext(filename)[1].lower()
    return LANGUAGE_EXTENSIONS.get(ext, "unknown")


def is_supported(language: str) -> bool:
    return language in SUPPORTED_LANGUAGES


def count_lines(code: str) -> int:
    return len(code.splitlines())


def count_blank_lines(code: str) -> int:
    return sum(1 for line in code.splitlines() if not line.strip())


def count_comment_lines(code: str, language: str) -> int:
    count = 0
    for line in code.splitlines():
        stripped = line.strip()
        if language == "python" and stripped.startswith("#"):
            count += 1
        elif language == "javascript" and (stripped.startswith("//") or stripped.startswith("*") or stripped.startswith("/*")):
            count += 1
    return count


def get_code_stats(code: str, language: str) -> dict:
    total    = count_lines(code)
    blank    = count_blank_lines(code)
    comments = count_comment_lines(code, language)
    actual   = total - blank - comments

    return {
        "totalLines"  : total,
        "blankLines"  : blank,
        "commentLines": comments,
        "codeLines"   : max(0, actual),
    }