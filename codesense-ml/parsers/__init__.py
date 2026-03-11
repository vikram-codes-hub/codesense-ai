from .base_parser       import detect_language, count_lines, get_lines, is_supported
from .python_parser     import parse_python
from .javascript_parser import parse_javascript

def parse_file(content: str, language: str) -> dict:
    if language == 'python':
        return parse_python(content)
    elif language in ('javascript', 'typescript'):
        return parse_javascript(content)
    return { 'functions': [], 'imports': [], 'error': None }