import ast
import re
from utils.logger import get_logger

logger = get_logger(__name__)

MAX_FUNCTION_LINES  = 50
MAX_FILE_LINES      = 300
MAX_PARAMS          = 5
MAX_NESTING_DEPTH   = 4
MAX_LINE_LENGTH     = 120


def analyze_style(code: str, language: str) -> list:
    issues = []

    if language == "python":
        issues = _analyze_python_style(code)
    elif language == "javascript":
        issues = _analyze_js_style(code)

    # Common checks for both languages
    issues += _check_line_length(code)
    issues += _check_todo_fixme(code)

    return issues


# ── Python Style ───────────────────────────────────────────
def _analyze_python_style(code: str) -> list:
    issues = []
    lines  = code.splitlines()

    issues += _check_file_length(lines)
    issues += _check_python_function_length(code)
    issues += _check_python_function_params(code)
    issues += _check_python_nesting(code)
    issues += _check_magic_numbers_python(code)

    return issues


def _check_python_function_length(code: str) -> list:
    issues = []

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return issues

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            end_line   = max(
                (getattr(child, 'lineno', node.lineno) for child in ast.walk(node)),
                default=node.lineno
            )
            func_lines = end_line - node.lineno + 1

            if func_lines > MAX_FUNCTION_LINES:
                severity = "high" if func_lines > MAX_FUNCTION_LINES * 2 else "medium"
                issues.append({
                    "type"       : "style",
                    "severity"   : severity,
                    "line"       : node.lineno,
                    "column"     : 1,
                    "message"    : f"Function '{node.name}' is too long ({func_lines} lines)",
                    "description": f"Functions longer than {MAX_FUNCTION_LINES} lines are hard to read, test, and maintain.",
                    "suggestion" : f"Break '{node.name}' into smaller functions. Each function should have a single responsibility.",
                    "code"       : f"def {node.name}(...):  # {func_lines} lines",
                })

    return issues


def _check_python_function_params(code: str) -> list:
    issues = []

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return issues

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            params = len(node.args.args) + len(node.args.posonlyargs)
            if params > MAX_PARAMS:
                issues.append({
                    "type"       : "style",
                    "severity"   : "medium",
                    "line"       : node.lineno,
                    "column"     : 1,
                    "message"    : f"Function '{node.name}' has too many parameters ({params})",
                    "description": f"Functions with more than {MAX_PARAMS} parameters are hard to call and test.",
                    "suggestion" : f"Group related parameters into a dict, dataclass, or object. Consider using **kwargs for optional params.",
                    "code"       : f"def {node.name}({', '.join(['...']*params)}):",
                })

    return issues


def _check_python_nesting(code: str) -> list:
    issues  = []
    lines   = code.splitlines()

    for i, line in enumerate(lines, 1):
        # Count indentation level (Python uses 4 spaces)
        stripped     = line.lstrip()
        if not stripped:
            continue
        indent_spaces = len(line) - len(stripped)
        indent_level  = indent_spaces // 4

        if indent_level > MAX_NESTING_DEPTH:
            issues.append({
                "type"       : "style",
                "severity"   : "medium",
                "line"       : i,
                "column"     : indent_spaces + 1,
                "message"    : f"Code nested too deeply (level {indent_level})",
                "description": f"Deep nesting (more than {MAX_NESTING_DEPTH} levels) makes code hard to read and follow.",
                "suggestion" : "Use early returns, extract helper functions, or restructure logic to reduce nesting.",
                "code"       : stripped[:80],
            })

    return issues


def _check_magic_numbers_python(code: str) -> list:
    issues = []

    # Allowed numbers
    ALLOWED = {0, 1, 2, -1, 100, 1000}

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return issues

    for node in ast.walk(tree):
        if isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float)):
                val = node.value
                if val not in ALLOWED and abs(val) > 2:
                    issues.append({
                        "type"       : "style",
                        "severity"   : "low",
                        "line"       : node.lineno,
                        "column"     : node.col_offset + 1,
                        "message"    : f"Magic number '{val}' — use a named constant",
                        "description": "Magic numbers are unexplained numeric literals. They make code hard to understand and maintain.",
                        "suggestion" : f"Replace {val} with a named constant: MAX_RETRIES = {val}",
                        "code"       : str(val),
                    })

    return issues


# ── JavaScript Style ───────────────────────────────────────
def _analyze_js_style(code: str) -> list:
    issues = []
    lines  = code.splitlines()

    issues += _check_file_length(lines)
    issues += _check_js_function_length(lines)
    issues += _check_js_nesting(lines)
    issues += _check_js_magic_numbers(lines)
    issues += _check_js_function_params(lines)

    return issues


def _check_js_function_length(lines: list) -> list:
    issues          = []
    in_function     = False
    func_start      = 0
    func_name       = "anonymous"
    brace_depth     = 0
    func_brace_depth= 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Detect function start
        func_match = re.search(r'(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()', stripped)
        if func_match and "{" in stripped:
            if not in_function:
                in_function      = True
                func_start       = i
                func_name        = func_match.group(1) or func_match.group(2) or "anonymous"
                func_brace_depth = brace_depth

        brace_depth += stripped.count("{") - stripped.count("}")

        if in_function and brace_depth <= func_brace_depth and i > func_start:
            func_lines = i - func_start + 1
            if func_lines > MAX_FUNCTION_LINES:
                severity = "high" if func_lines > MAX_FUNCTION_LINES * 2 else "medium"
                issues.append({
                    "type"       : "style",
                    "severity"   : severity,
                    "line"       : func_start,
                    "column"     : 1,
                    "message"    : f"Function '{func_name}' is too long ({func_lines} lines)",
                    "description": f"Functions longer than {MAX_FUNCTION_LINES} lines are hard to read and maintain.",
                    "suggestion" : "Break into smaller functions. Use the Single Responsibility Principle.",
                    "code"       : f"function {func_name}() {{  // {func_lines} lines",
                })
            in_function = False

    return issues


def _check_js_nesting(lines: list) -> list:
    issues      = []
    brace_depth = 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if not stripped or stripped.startswith("//"):
            continue

        brace_depth += stripped.count("{") - stripped.count("}")

        if brace_depth > MAX_NESTING_DEPTH:
            issues.append({
                "type"       : "style",
                "severity"   : "medium",
                "line"       : i,
                "column"     : 1,
                "message"    : f"Code nested too deeply (depth {brace_depth})",
                "description": f"Deep nesting beyond {MAX_NESTING_DEPTH} levels makes code hard to follow.",
                "suggestion" : "Use early returns (guard clauses), extract functions, or restructure logic.",
                "code"       : stripped[:80],
            })

    return issues


def _check_js_magic_numbers(lines: list) -> list:
    issues  = []
    ALLOWED = {"0", "1", "2", "-1", "100", "1000", "200", "404", "500"}

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue

        # Find standalone numbers not in strings
        matches = re.finditer(r'(?<!["\'\w])(\d{2,})(?!["\'\w])', line)
        for match in matches:
            num = match.group(1)
            if num not in ALLOWED:
                issues.append({
                    "type"       : "style",
                    "severity"   : "low",
                    "line"       : i,
                    "column"     : match.start() + 1,
                    "message"    : f"Magic number '{num}' — use a named constant",
                    "description": "Unexplained numbers make code hard to understand and maintain.",
                    "suggestion" : f"const MAX_SOMETHING = {num};  // then use MAX_SOMETHING",
                    "code"       : stripped[:120],
                })
                break  # One per line is enough

    return issues


def _check_js_function_params(lines: list) -> list:
    issues = []

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue

        # Match function parameters
        match = re.search(r'(?:function\s+\w*|=>)\s*\(([^)]+)\)', stripped)
        if match:
            params = [p.strip() for p in match.group(1).split(",") if p.strip()]
            if len(params) > MAX_PARAMS:
                issues.append({
                    "type"       : "style",
                    "severity"   : "medium",
                    "line"       : i,
                    "column"     : 1,
                    "message"    : f"Function has too many parameters ({len(params)})",
                    "description": f"More than {MAX_PARAMS} parameters makes a function hard to use and test.",
                    "suggestion" : "Group related parameters into an options object: function fn({ param1, param2, param3 })",
                    "code"       : stripped[:120],
                })

    return issues


# ── Common Checks ──────────────────────────────────────────
def _check_file_length(lines: list) -> list:
    total = len(lines)
    if total > MAX_FILE_LINES:
        return [{
            "type"       : "style",
            "severity"   : "low",
            "line"       : 1,
            "column"     : 1,
            "message"    : f"File is too long ({total} lines)",
            "description": f"Files longer than {MAX_FILE_LINES} lines become hard to navigate and maintain.",
            "suggestion" : "Consider splitting into multiple smaller, focused files.",
            "code"       : f"# {total} total lines",
        }]
    return []


def _check_line_length(code: str) -> list:
    issues = []
    lines  = code.splitlines()

    for i, line in enumerate(lines, 1):
        if len(line) > MAX_LINE_LENGTH:
            issues.append({
                "type"       : "style",
                "severity"   : "low",
                "line"       : i,
                "column"     : MAX_LINE_LENGTH + 1,
                "message"    : f"Line too long ({len(line)} characters)",
                "description": f"Lines longer than {MAX_LINE_LENGTH} characters are hard to read without horizontal scrolling.",
                "suggestion" : "Break long lines using line continuation or extract variables.",
                "code"       : line[:80] + "...",
            })

    return issues


def _check_todo_fixme(code: str) -> list:
    issues = []
    lines  = code.splitlines()

    for i, line in enumerate(lines, 1):
        if re.search(r'#\s*(TODO|FIXME|HACK|XXX|BUG)', line, re.IGNORECASE):
            tag = re.search(r'(TODO|FIXME|HACK|XXX|BUG)', line, re.IGNORECASE).group(1).upper()
            issues.append({
                "type"       : "style",
                "severity"   : "low",
                "line"       : i,
                "column"     : 1,
                "message"    : f"{tag} comment found — unfinished work",
                "description": f"A {tag} comment indicates unfinished or problematic code.",
                "suggestion" : f"Address this {tag} before merging to production.",
                "code"       : line.strip()[:120],
            })

    return issues