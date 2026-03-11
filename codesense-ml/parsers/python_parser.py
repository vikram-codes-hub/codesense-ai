import ast
from utils.logger import get_logger

logger = get_logger(__name__)


def parse_python(code: str) -> dict:
    """
    Parse Python code using AST and extract structure.
    Returns functions, classes, imports, and metadata.
    """
    result = {
        "functions": [],
        "classes"  : [],
        "imports"  : [],
        "hasErrors": False,
        "errorMsg" : None,
    }

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        result["hasErrors"] = True
        result["errorMsg"]  = f"Syntax error at line {e.lineno}: {e.msg}"
        return result

    for node in ast.walk(tree):

        # Functions
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            end_line = max(
                (getattr(child, 'lineno', node.lineno) for child in ast.walk(node)),
                default=node.lineno
            )
            result["functions"].append({
                "name"    : node.name,
                "line"    : node.lineno,
                "endLine" : end_line,
                "params"  : [arg.id if hasattr(arg, 'id') else arg.arg for arg in node.args.args],
                "isAsync" : isinstance(node, ast.AsyncFunctionDef),
            })

        # Classes
        elif isinstance(node, ast.ClassDef):
            result["classes"].append({
                "name": node.name,
                "line": node.lineno,
            })

        # Imports
        elif isinstance(node, ast.Import):
            for alias in node.names:
                result["imports"].append({
                    "name": alias.name,
                    "line": node.lineno,
                })

        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                result["imports"].append({
                    "name": f"{module}.{alias.name}",
                    "line": node.lineno,
                })

    return result