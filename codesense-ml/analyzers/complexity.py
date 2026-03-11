from radon.complexity import cc_visit
from radon.metrics    import mi_visit
from utils.logger     import get_logger

logger = get_logger(__name__)

COMPLEXITY_THRESHOLDS = {
    "low"     : 5,   # A-B grade — fine
    "medium"  : 10,  # C grade   — warn
    "high"    : 15,  # D grade   — serious
    "critical": 20,  # F grade   — must fix
}


def analyze_complexity(code: str, language: str) -> list:
    """
    Analyze cyclomatic complexity of code.
    Works best on Python. For JS we do basic heuristics.
    """
    issues = []

    if language == "python":
        issues = _analyze_python_complexity(code)
    elif language == "javascript":
        issues = _analyze_js_complexity(code)

    return issues


def _analyze_python_complexity(code: str) -> list:
    issues = []

    try:
        # radon cc_visit returns complexity per function/method
        blocks = cc_visit(code)

        for block in blocks:
            complexity = block.complexity
            name       = block.name
            line       = block.lineno

            if complexity >= COMPLEXITY_THRESHOLDS["critical"]:
                severity = "critical"
                message  = f"Function '{name}' has extremely high complexity ({complexity})"
            elif complexity >= COMPLEXITY_THRESHOLDS["high"]:
                severity = "high"
                message  = f"Function '{name}' has very high complexity ({complexity})"
            elif complexity >= COMPLEXITY_THRESHOLDS["medium"]:
                severity = "medium"
                message  = f"Function '{name}' has high complexity ({complexity})"
            else:
                continue  # complexity is fine, skip

            issues.append({
                "type"       : "complexity",
                "severity"   : severity,
                "line"       : line,
                "column"     : 1,
                "message"    : message,
                "description": (
                    f"Cyclomatic complexity of {complexity} means there are {complexity} "
                    f"independent paths through this function. High complexity makes code "
                    f"hard to test and maintain."
                ),
                "suggestion" : (
                    "Break this function into smaller, focused functions. "
                    "Each function should do one thing well. "
                    f"Aim for complexity below {COMPLEXITY_THRESHOLDS['low']}."
                ),
                "code"       : f"def {name}(...):  # complexity: {complexity}",
            })

    except Exception as e:
        logger.warning(f"Python complexity analysis failed: {e}")

    # Maintainability Index
    try:
        mi = mi_visit(code, multi=True)
        if isinstance(mi, (int, float)) and mi < 20:
            issues.append({
                "type"       : "complexity",
                "severity"   : "medium",
                "line"       : 1,
                "column"     : 1,
                "message"    : f"Low maintainability index: {mi:.1f}/100",
                "description": "This file has very low maintainability. It may be too complex overall.",
                "suggestion" : "Refactor the file — extract classes, reduce nesting, add comments.",
                "code"       : "",
            })
    except Exception:
        pass

    return issues


def _analyze_js_complexity(code: str) -> list:
    """
    Basic heuristic complexity analysis for JavaScript.
    Counts decision points (if, else, for, while, switch, catch, &&, ||)
    """
    issues  = []
    lines   = code.splitlines()

    # Keywords that increase complexity
    DECISION_KEYWORDS = [
        "if ", "if(", "else if", "else{", "else {",
        "for ", "for(", "while ", "while(",
        "switch ", "switch(", "case ",
        "catch ", "catch(",
        " && ", " || ", "?.","??"
    ]

    # Track function complexity
    current_function      = None
    current_function_line = 1
    function_complexity   = 0
    brace_depth           = 0
    function_start_depth  = 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Detect function start
        if ("function " in stripped or "=> {" in stripped or "=> {" in stripped):
            if brace_depth == function_start_depth or current_function is None:
                # Extract function name
                if "function " in stripped:
                    parts = stripped.split("function ")
                    if len(parts) > 1:
                        name_part = parts[1].split("(")[0].strip()
                        current_function = name_part if name_part else f"anonymous_{i}"
                else:
                    # Arrow function
                    parts = stripped.split("=")
                    current_function = parts[0].strip().replace("const ", "").replace("let ", "").replace("var ", "") if parts else f"anonymous_{i}"

                current_function_line = i
                function_complexity   = 1  # base complexity
                function_start_depth  = brace_depth

        # Count braces for depth tracking
        brace_depth += stripped.count("{") - stripped.count("}")

        # Count decision points
        for keyword in DECISION_KEYWORDS:
            if keyword in stripped:
                function_complexity += stripped.count(keyword)

        # Check if function ended
        if current_function and brace_depth <= function_start_depth and i > current_function_line:
            if function_complexity >= COMPLEXITY_THRESHOLDS["critical"]:
                severity = "critical"
            elif function_complexity >= COMPLEXITY_THRESHOLDS["high"]:
                severity = "high"
            elif function_complexity >= COMPLEXITY_THRESHOLDS["medium"]:
                severity = "medium"
            else:
                current_function    = None
                function_complexity = 0
                continue

            issues.append({
                "type"       : "complexity",
                "severity"   : severity,
                "line"       : current_function_line,
                "column"     : 1,
                "message"    : f"Function '{current_function}' has high complexity ({function_complexity})",
                "description": (
                    f"This function has approximately {function_complexity} decision points. "
                    "High complexity makes code difficult to test and maintain."
                ),
                "suggestion" : (
                    "Break this function into smaller, focused functions. "
                    "Extract complex conditions into named variables or helper functions."
                ),
                "code"       : f"// function {current_function} — complexity ~{function_complexity}",
            })

            current_function    = None
            function_complexity = 0

    return issues