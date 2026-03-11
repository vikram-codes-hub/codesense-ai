import ast
import json
import os
import re
from utils.logger import get_logger

logger = get_logger(__name__)

# Load custom security patterns from JSON
_PATTERNS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "security_patterns.json")

def _load_patterns():
    try:
        with open(_PATTERNS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load security patterns: {e}")
        return {}

PATTERNS = _load_patterns()


def analyze_security(code: str, language: str) -> list:
    issues = []

    if language == "python":
        issues += _analyze_python_security(code)
    elif language == "javascript":
        issues += _analyze_js_security(code)

    # Run secret detection on both languages
    issues += _detect_secrets(code)

    return issues


# ── Python Security ────────────────────────────────────────
def _analyze_python_security(code: str) -> list:
    issues  = []
    lines   = code.splitlines()

    # Pattern-based checks
    py_patterns = PATTERNS.get("python", {})

    for severity, checks in py_patterns.items():
        if severity == "secrets":
            continue
        for check in checks:
            pattern = check.get("pattern", "")
            for i, line in enumerate(lines, 1):
                if pattern in line and not line.strip().startswith("#"):
                    issues.append({
                        "type"       : "security",
                        "severity"   : severity,
                        "line"       : i,
                        "column"     : line.find(pattern) + 1,
                        "message"    : check.get("message", "Security issue detected"),
                        "description": _get_description(pattern),
                        "suggestion" : check.get("fix", "Review and fix this security issue"),
                        "code"       : line.strip(),
                    })

    # AST-based checks
    issues += _analyze_python_ast_security(code)

    return issues


def _analyze_python_ast_security(code: str) -> list:
    issues = []

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return issues

    for node in ast.walk(tree):

        # eval() / exec() usage
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in ("eval", "exec", "compile"):
                    issues.append({
                        "type"       : "security",
                        "severity"   : "critical",
                        "line"       : node.lineno,
                        "column"     : node.col_offset + 1,
                        "message"    : f"Dangerous function '{node.func.id}()' detected",
                        "description": f"'{node.func.id}()' executes arbitrary code and is extremely dangerous with user input.",
                        "suggestion" : f"Never use {node.func.id}() with user-controlled data. Find an alternative approach.",
                        "code"       : f"{node.func.id}(...)",
                    })

            # pickle.loads()
            if isinstance(node.func, ast.Attribute):
                if node.func.attr == "loads" and isinstance(node.func.value, ast.Name):
                    if node.func.value.id == "pickle":
                        issues.append({
                            "type"       : "security",
                            "severity"   : "critical",
                            "line"       : node.lineno,
                            "column"     : node.col_offset + 1,
                            "message"    : "Unsafe deserialization with pickle.loads()",
                            "description": "pickle.loads() can execute arbitrary code when deserializing untrusted data.",
                            "suggestion" : "Use JSON for data serialization instead of pickle for untrusted input.",
                            "code"       : "pickle.loads(...)",
                        })

                # subprocess with shell=True
                if node.func.attr in ("call", "run", "Popen", "check_output"):
                    for keyword in node.keywords:
                        if keyword.arg == "shell":
                            if isinstance(keyword.value, ast.Constant) and keyword.value.value is True:
                                issues.append({
                                    "type"       : "security",
                                    "severity"   : "high",
                                    "line"       : node.lineno,
                                    "column"     : node.col_offset + 1,
                                    "message"    : "subprocess called with shell=True — command injection risk",
                                    "description": "Using shell=True allows shell injection attacks if any input is user-controlled.",
                                    "suggestion" : "Use shell=False and pass arguments as a list: subprocess.run(['cmd', 'arg'])",
                                    "code"       : f"subprocess.{node.func.attr}(..., shell=True)",
                                })

        # String formatting in SQL queries
        if isinstance(node, (ast.JoinedStr, ast.BinOp)):
            # Check parent context — hard without full AST walk
            pass

        # assert statements (security bypass in optimized mode)
        if isinstance(node, ast.Assert):
            issues.append({
                "type"       : "security",
                "severity"   : "medium",
                "line"       : node.lineno,
                "column"     : node.col_offset + 1,
                "message"    : "Security check using assert — bypassed in optimized mode (-O flag)",
                "description": "assert statements are removed when Python runs with -O optimization flag.",
                "suggestion" : "Use explicit if/raise statements for security checks instead of assert.",
                "code"       : "assert ...",
            })

    return issues


# ── JavaScript Security ────────────────────────────────────
def _analyze_js_security(code: str) -> list:
    issues  = []
    lines   = code.splitlines()

    js_patterns = PATTERNS.get("javascript", {})

    for severity, checks in js_patterns.items():
        for check in checks:
            pattern = check.get("pattern", "")
            for i, line in enumerate(lines, 1):
                stripped = line.strip()
                # Skip comments
                if stripped.startswith("//") or stripped.startswith("*") or stripped.startswith("/*"):
                    continue
                if pattern in line:
                    issues.append({
                        "type"       : "security",
                        "severity"   : severity,
                        "line"       : i,
                        "column"     : line.find(pattern) + 1,
                        "message"    : check.get("message", "Security issue detected"),
                        "description": _get_description(pattern),
                        "suggestion" : check.get("fix", "Review and fix this security issue"),
                        "code"       : stripped[:120],
                    })

    # Additional JS-specific checks
    issues += _analyze_js_extra(code, lines)

    return issues


def _analyze_js_extra(code: str, lines: list) -> list:
    issues = []

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Skip comments
        if stripped.startswith("//") or stripped.startswith("*"):
            continue

        # SQL injection patterns
        sql_patterns = [
            r'["\']SELECT.*\+',
            r'["\']INSERT.*\+',
            r'["\']UPDATE.*\+',
            r'["\']DELETE.*\+',
            r'query\s*=.*\+.*req\.',
            r'query\s*=.*\$\{',
        ]
        for pattern in sql_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                issues.append({
                    "type"       : "security",
                    "severity"   : "critical",
                    "line"       : i,
                    "column"     : 1,
                    "message"    : "SQL Injection vulnerability — user input in SQL query",
                    "description": "Concatenating user input directly into SQL queries allows attackers to manipulate database queries.",
                    "suggestion" : "Use parameterized queries or prepared statements: db.query('SELECT * FROM users WHERE id = ?', [userId])",
                    "code"       : stripped[:120],
                })
                break

        # JWT secret hardcoded
        if re.search(r'jwt\.sign\(.*["\'][a-zA-Z0-9]{8,}["\']', line):
            issues.append({
                "type"       : "security",
                "severity"   : "critical",
                "line"       : i,
                "column"     : 1,
                "message"    : "Hardcoded JWT secret detected",
                "description": "JWT secret is hardcoded in source code. Anyone with repo access can forge tokens.",
                "suggestion" : "Use process.env.JWT_SECRET and store it in environment variables.",
                "code"       : stripped[:120],
            })

        # CORS wildcard
        if "origin:" in line.lower() and '"*"' in line:
            issues.append({
                "type"       : "security",
                "severity"   : "medium",
                "line"       : i,
                "column"     : 1,
                "message"    : "CORS wildcard (*) allows any origin",
                "description": "Allowing all origins with '*' can expose your API to cross-site request forgery.",
                "suggestion" : "Specify allowed origins explicitly: origin: process.env.CLIENT_URL",
                "code"       : stripped[:120],
            })

    return issues


# ── Secret Detection (both languages) ─────────────────────
def _detect_secrets(code: str) -> list:
    issues  = []
    lines   = code.splitlines()

    secret_patterns = PATTERNS.get("secrets", [])

    # Additional regex-based secret detection
    regex_patterns = [
        (r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']{4,}["\']',   "Hardcoded password detected",      "critical"),
        (r'(?i)(api_key|apikey|api-key)\s*=\s*["\'][^"\']{8,}["\']',"Hardcoded API key detected",        "critical"),
        (r'(?i)(secret|secret_key)\s*=\s*["\'][^"\']{8,}["\']',     "Hardcoded secret detected",         "critical"),
        (r'(?i)(token)\s*=\s*["\'][^"\']{8,}["\']',                  "Hardcoded token detected",          "high"),
        (r'AKIA[0-9A-Z]{16}',                                         "AWS Access Key ID detected",        "critical"),
        (r'(?i)bearer\s+[a-zA-Z0-9\-_\.]{20,}',                      "Hardcoded Bearer token detected",   "critical"),
        (r'-----BEGIN (RSA |EC )?PRIVATE KEY-----',                   "Private key in source code",        "critical"),
        (r'(?i)(db_password|database_password)\s*=\s*["\'][^"\']+["\']', "Hardcoded database password",   "critical"),
    ]

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Skip comments
        if stripped.startswith("#") or stripped.startswith("//") or stripped.startswith("*"):
            continue

        # Pattern-based
        for pattern_check in secret_patterns:
            pattern = pattern_check.get("pattern", "")
            if pattern.lower() in line.lower():
                issues.append({
                    "type"       : "security",
                    "severity"   : "critical",
                    "line"       : i,
                    "column"     : 1,
                    "message"    : pattern_check.get("message", "Hardcoded secret detected"),
                    "description": "Hardcoded secrets in source code are a critical security risk. Anyone with repo access can steal credentials.",
                    "suggestion" : pattern_check.get("fix", "Move to environment variables immediately"),
                    "code"       : _redact_secret(stripped),
                })

        # Regex-based
        for regex, message, severity in regex_patterns:
            if re.search(regex, line):
                issues.append({
                    "type"       : "security",
                    "severity"   : severity,
                    "line"       : i,
                    "column"     : 1,
                    "message"    : message,
                    "description": "Credentials or secrets found directly in source code. This is a critical security vulnerability.",
                    "suggestion" : "Use environment variables: process.env.SECRET_KEY or os.getenv('SECRET_KEY')",
                    "code"       : _redact_secret(stripped),
                })
                break

    return issues


def _redact_secret(line: str) -> str:
    """Redact the actual secret value for safety"""
    return re.sub(r'(["\'])([^"\']{4})[^"\']*(["\'])', r'\1\2****\3', line)[:120]


def _get_description(pattern: str) -> str:
    descriptions = {
        "eval("           : "eval() executes arbitrary JavaScript/Python code. Dangerous with any user input.",
        "innerHTML"       : "Setting innerHTML directly can execute malicious scripts (XSS).",
        "document.write(" : "document.write() can overwrite the entire page and execute scripts.",
        "exec("           : "exec() executes arbitrary code. Never use with user-controlled input.",
        "pickle.loads("   : "pickle.loads() can execute code during deserialization of untrusted data.",
        "subprocess"      : "Shell commands with user input can lead to command injection attacks.",
        "MD5"             : "MD5 is cryptographically broken. Use SHA-256 or bcrypt for passwords.",
        "SHA1"            : "SHA1 is deprecated. Use SHA-256 or better.",
        "Math.random()"   : "Math.random() is not cryptographically secure. Use crypto.randomBytes().",
        "http://"         : "HTTP transmits data in plaintext. Use HTTPS for all connections.",
    }
    for key, desc in descriptions.items():
        if key in pattern:
            return desc
    return "This pattern is a known security risk. Review carefully."