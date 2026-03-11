import re
from utils.logger import get_logger

logger = get_logger(__name__)


def parse_javascript(code: str) -> dict:
    """
    Parse JavaScript/TypeScript code using regex heuristics.
    Extracts functions, imports, and basic structure.
    """
    result = {
        "functions": [],
        "classes"  : [],
        "imports"  : [],
        "hasErrors": False,
        "errorMsg" : None,
    }

    lines = code.splitlines()

    result["functions"] = _extract_functions(lines)
    result["classes"]   = _extract_classes(lines)
    result["imports"]   = _extract_imports(lines)

    return result


def _extract_functions(lines: list) -> list:
    functions = []

    patterns = [
        r'(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(',           # function declarations
        r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>', # arrow functions
        r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?function',       # function expressions
        r'(\w+)\s*\([^)]*\)\s*\{',                                       # method shorthand
    ]

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue

        for pattern in patterns:
            match = re.search(pattern, stripped)
            if match:
                name = match.group(1)
                if name and name not in ("if", "for", "while", "switch", "catch"):
                    functions.append({
                        "name"   : name,
                        "line"   : i,
                        "isAsync": "async" in stripped[:stripped.find(name)],
                    })
                    break

    return functions


def _extract_classes(lines: list) -> list:
    classes = []

    for i, line in enumerate(lines, 1):
        match = re.search(r'(?:export\s+)?class\s+(\w+)', line)
        if match:
            classes.append({
                "name": match.group(1),
                "line": i,
            })

    return classes


def _extract_imports(lines: list) -> list:
    imports = []

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # ES6 imports
        match = re.match(r'import\s+.+\s+from\s+["\'](.+)["\']', stripped)
        if match:
            imports.append({
                "name": match.group(1),
                "line": i,
            })
            continue

        # require()
        match = re.search(r'require\(["\'](.+)["\']\)', stripped)
        if match:
            imports.append({
                "name": match.group(1),
                "line": i,
            })

    return imports