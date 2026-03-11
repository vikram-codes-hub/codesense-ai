import ast
import re
from utils.logger import get_logger

logger = get_logger(__name__)


def analyze_bugs(code: str, language: str) -> list:
    issues = []

    if language == "python":
        issues = _analyze_python_bugs(code)
    elif language == "javascript":
        issues = _analyze_js_bugs(code)

    return issues


# ── Python Bug Detection ───────────────────────────────────
def _analyze_python_bugs(code: str) -> list:
    issues = []

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return [{
            "type"       : "bug",
            "severity"   : "critical",
            "line"       : e.lineno or 1,
            "column"     : e.offset or 1,
            "message"    : f"Syntax error: {e.msg}",
            "description": "This code has a syntax error and cannot be executed.",
            "suggestion" : "Fix the syntax error before anything else.",
            "code"       : e.text.strip() if e.text else "",
        }]

    issues += _check_unused_variables(tree, code)
    issues += _check_bare_except(tree, code)
    issues += _check_mutable_defaults(tree, code)
    issues += _check_unreachable_code(tree, code)
    issues += _check_comparison_to_none(tree, code)
    issues += _check_empty_except(tree, code)

    return issues


def _check_unused_variables(tree: ast.AST, code: str) -> list:
    issues = []

    # Collect all assigned names
    assigned = {}
    used     = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    # Don't flag _ (intentionally unused)
                    if target.id != "_" and not target.id.startswith("_"):
                        assigned[target.id] = node.lineno

        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
            used.add(node.id)

    for name, line in assigned.items():
        if name not in used:
            issues.append({
                "type"       : "bug",
                "severity"   : "low",
                "line"       : line,
                "column"     : 1,
                "message"    : f"Unused variable '{name}'",
                "description": f"Variable '{name}' is assigned but never used. This may indicate a logic error.",
                "suggestion" : f"Remove '{name}' if not needed, or use it. Use '_' prefix for intentionally unused variables.",
                "code"       : f"{name} = ...",
            })

    return issues


def _check_bare_except(tree: ast.AST, code: str) -> list:
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Try):
            for handler in node.handlers:
                if handler.type is None:
                    issues.append({
                        "type"       : "bug",
                        "severity"   : "medium",
                        "line"       : handler.lineno,
                        "column"     : 1,
                        "message"    : "Bare 'except:' clause catches all exceptions including SystemExit",
                        "description": "Using bare except catches ALL exceptions including KeyboardInterrupt and SystemExit, which can cause your program to ignore critical errors.",
                        "suggestion" : "Specify the exception type: except Exception as e: or except (TypeError, ValueError) as e:",
                        "code"       : "except:",
                    })
                # Empty except body
                elif len(handler.body) == 1 and isinstance(handler.body[0], ast.Pass):
                    issues.append({
                        "type"       : "bug",
                        "severity"   : "medium",
                        "line"       : handler.lineno,
                        "column"     : 1,
                        "message"    : "Empty except block silently swallows exceptions",
                        "description": "An except block with only 'pass' silently ignores errors, making debugging extremely difficult.",
                        "suggestion" : "At minimum, log the error: logger.error(f'Error: {e}')",
                        "code"       : "except ...:\n    pass",
                    })

    return issues


def _check_mutable_defaults(tree: ast.AST, code: str) -> list:
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for default in node.args.defaults:
                if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                    type_name = type(default).__name__.lower()
                    issues.append({
                        "type"       : "bug",
                        "severity"   : "high",
                        "line"       : node.lineno,
                        "column"     : 1,
                        "message"    : f"Mutable default argument ({type_name}) in function '{node.name}'",
                        "description": f"Mutable default arguments are shared across ALL calls to the function. Modifying it in one call affects all future calls.",
                        "suggestion" : f"Use None as default and create the {type_name} inside the function:\ndef {node.name}(arg=None):\n    if arg is None: arg = {type_name[0].upper() + type_name[1:]}()",
                        "code"       : f"def {node.name}(arg={type_name}()):",
                    })

    return issues


def _check_unreachable_code(tree: ast.AST, code: str) -> list:
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            stmts = node.body
            for i, stmt in enumerate(stmts[:-1]):
                if isinstance(stmt, (ast.Return, ast.Raise, ast.Break, ast.Continue)):
                    next_stmt = stmts[i + 1]
                    # Skip docstrings and comments
                    if not (isinstance(next_stmt, ast.Expr) and isinstance(next_stmt.value, ast.Constant)):
                        issues.append({
                            "type"       : "bug",
                            "severity"   : "medium",
                            "line"       : next_stmt.lineno,
                            "column"     : 1,
                            "message"    : "Unreachable code detected after return/raise/break/continue",
                            "description": "Code after a return, raise, break, or continue statement will never execute.",
                            "suggestion" : "Remove the unreachable code or restructure the logic.",
                            "code"       : f"# unreachable code at line {next_stmt.lineno}",
                        })

    return issues


def _check_comparison_to_none(tree: ast.AST, code: str) -> list:
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Compare):
            for op, comparator in zip(node.ops, node.comparators):
                if isinstance(comparator, ast.Constant) and comparator.value is None:
                    if isinstance(op, (ast.Eq, ast.NotEq)):
                        op_str = "==" if isinstance(op, ast.Eq) else "!="
                        issues.append({
                            "type"       : "bug",
                            "severity"   : "low",
                            "line"       : node.lineno,
                            "column"     : node.col_offset + 1,
                            "message"    : f"Use 'is None' instead of '{op_str} None'",
                            "description": "Comparing to None with == or != can give unexpected results due to __eq__ overrides.",
                            "suggestion" : f"Use 'if x is None:' or 'if x is not None:' instead of '== None' or '!= None'",
                            "code"       : f"x {op_str} None",
                        })

    return issues


def _check_empty_except(tree: ast.AST, code: str) -> list:
    """Already covered in bare_except — placeholder for extension"""
    return []


# ── JavaScript Bug Detection ───────────────────────────────
def _analyze_js_bugs(code: str) -> list:
    issues = []
    lines  = code.splitlines()

    issues += _check_js_console_logs(lines)
    issues += _check_js_var_usage(lines)
    issues += _check_js_equality(lines)
    issues += _check_js_missing_await(lines)
    issues += _check_js_unreachable(lines)
    issues += _check_js_empty_catch(lines)

    return issues


def _check_js_console_logs(lines: list) -> list:
    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        if re.search(r'console\.(log|debug|info|warn|error)\(', line):
            issues.append({
                "type"       : "bug",
                "severity"   : "low",
                "line"       : i,
                "column"     : line.find("console") + 1,
                "message"    : "console.log() left in production code",
                "description": "Console statements should be removed from production code. They can expose sensitive data and slow performance.",
                "suggestion" : "Remove console.log() statements or replace with a proper logging library.",
                "code"       : stripped[:120],
            })
    return issues


def _check_js_var_usage(lines: list) -> list:
    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        if re.match(r'\bvar\b\s+\w+', stripped):
            issues.append({
                "type"       : "bug",
                "severity"   : "low",
                "line"       : i,
                "column"     : 1,
                "message"    : "Use 'const' or 'let' instead of 'var'",
                "description": "'var' has function scope and hoisting behavior that causes unexpected bugs. 'const' and 'let' are block-scoped and predictable.",
                "suggestion" : "Replace 'var' with 'const' for values that don't change, or 'let' for values that do.",
                "code"       : stripped[:120],
            })
    return issues


def _check_js_equality(lines: list) -> list:
    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        # == but not === (avoid false positives on >=, <=, !=)
        if re.search(r'(?<![!<>=])==(?!=)', line) and "===" not in line:
            issues.append({
                "type"       : "bug",
                "severity"   : "medium",
                "line"       : i,
                "column"     : line.find("==") + 1,
                "message"    : "Use '===' instead of '==' for strict equality",
                "description": "'==' performs type coercion which causes unexpected results: 0 == '0' is true, null == undefined is true.",
                "suggestion" : "Always use '===' for comparisons to avoid type coercion bugs.",
                "code"       : stripped[:120],
            })
    return issues


def _check_js_missing_await(lines: list) -> list:
    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        # Promise returned but not awaited
        if re.search(r'(?<!await\s)(fetch|axios\.|mongoose\.|\.findOne|\.find\(|\.save\(|\.create\()', line):
            if "await" not in line and "then(" not in line and "catch(" not in line:
                if "=" in line or "return" in line:
                    issues.append({
                        "type"       : "bug",
                        "severity"   : "high",
                        "line"       : i,
                        "column"     : 1,
                        "message"    : "Possible missing 'await' on async operation",
                        "description": "This async operation may not be awaited, causing you to work with a Promise object instead of the actual result.",
                        "suggestion" : "Add 'await' before async calls in async functions, or use .then() for Promise chaining.",
                        "code"       : stripped[:120],
                    })
    return issues


def _check_js_unreachable(lines: list) -> list:
    issues   = []
    returned = False

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if stripped.startswith("//"):
            continue

        if stripped.startswith("}"):
            returned = False

        if returned and stripped and not stripped.startswith("//") and not stripped.startswith("}"):
            issues.append({
                "type"       : "bug",
                "severity"   : "medium",
                "line"       : i,
                "column"     : 1,
                "message"    : "Unreachable code after return statement",
                "description": "Code after a return statement will never execute.",
                "suggestion" : "Remove unreachable code or restructure the function logic.",
                "code"       : stripped[:120],
            })
            returned = False  # Only flag once per block

        if re.match(r'\breturn\b', stripped) and not stripped.endswith("{"):
            returned = True

    return issues


def _check_js_empty_catch(lines: list) -> list:
    issues      = []
    in_catch    = False
    catch_line  = 0
    catch_depth = 0
    brace_depth = 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if re.match(r'catch\s*\(', stripped) or stripped == "catch {":
            in_catch    = True
            catch_line  = i
            catch_depth = brace_depth

        brace_depth += stripped.count("{") - stripped.count("}")

        if in_catch and brace_depth <= catch_depth and i > catch_line:
            # Check if catch body only has } or is empty
            body_lines = [l.strip() for l in lines[catch_line:i-1] if l.strip() and l.strip() != "{"]
            if not body_lines or all(l in ("}", "// TODO", "// todo") for l in body_lines):
                issues.append({
                    "type"       : "bug",
                    "severity"   : "medium",
                    "line"       : catch_line,
                    "column"     : 1,
                    "message"    : "Empty catch block silently swallows errors",
                    "description": "An empty catch block ignores all errors, making debugging impossible.",
                    "suggestion" : "At minimum log the error: console.error(err) or use a logger.",
                    "code"       : "catch (err) { }",
                })
            in_catch = False

    return issues