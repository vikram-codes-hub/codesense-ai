import datetime


def format_response(filename: str, language: str, issues: list, score: dict, total_lines: int = 0) -> dict:
    """
    Format the analysis result into a clean JSON response
    that Node.js backend expects.
    """

    # Sort issues: critical first, then high, medium, low
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_issues  = sorted(issues, key=lambda x: severity_order.get(x.get("severity", "low"), 3))

    # Group by type
    security_issues   = [i for i in sorted_issues if i.get("type") == "security"]
    bug_issues        = [i for i in sorted_issues if i.get("type") == "bug"]
    complexity_issues = [i for i in sorted_issues if i.get("type") == "complexity"]
    style_issues      = [i for i in sorted_issues if i.get("type") == "style"]

    return {
        "success"    : True,
        "filename"   : filename,
        "language"   : language,
        "totalLines" : total_lines,
        "analyzedAt" : datetime.datetime.utcnow().isoformat(),

        # Scores
        "score": {
            "overall"   : score.get("overallScore",    100),
            "security"  : score.get("securityScore",   100),
            "bugs"      : score.get("bugScore",        100),
            "complexity": score.get("complexityScore", 100),
            "style"     : score.get("styleScore",      100),
            "grade"     : score.get("grade",           "A"),
            "gradeLabel": score.get("gradeLabel",      "Excellent"),
            "gradeColor": score.get("gradeColor",      "#22c55e"),
        },

        # Summary counts
        "summary": {
            "totalIssues"   : len(issues),
            "criticalCount" : score.get("breakdown", {}).get("critical", 0),
            "highCount"     : score.get("breakdown", {}).get("high",     0),
            "mediumCount"   : score.get("breakdown", {}).get("medium",   0),
            "lowCount"      : score.get("breakdown", {}).get("low",      0),
            "securityCount" : len(security_issues),
            "bugCount"      : len(bug_issues),
            "complexityCount": len(complexity_issues),
            "styleCount"    : len(style_issues),
        },

        # All issues sorted by severity
        "issues": [_format_issue(i) for i in sorted_issues],

        # Grouped by category
        "byCategory": {
            "security"  : [_format_issue(i) for i in security_issues],
            "bugs"      : [_format_issue(i) for i in bug_issues],
            "complexity": [_format_issue(i) for i in complexity_issues],
            "style"     : [_format_issue(i) for i in style_issues],
        },
    }


def _format_issue(issue: dict) -> dict:
    """Ensure every issue has all required fields"""
    return {
        "type"       : issue.get("type",        "style"),
        "severity"   : issue.get("severity",    "low"),
        "line"       : issue.get("line",        1),
        "column"     : issue.get("column",      1),
        "message"    : issue.get("message",     "Issue detected"),
        "description": issue.get("description", ""),
        "suggestion" : issue.get("suggestion",  "Review this code"),
        "code"       : issue.get("code",        ""),
    }