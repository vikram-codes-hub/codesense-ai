SEVERITY_PENALTIES = {
    "critical": 25,
    "high"    : 15,
    "medium"  :  8,
    "low"     :  3,
}

CATEGORY_WEIGHTS = {
    "security"  : 0.40,
    "bug"       : 0.30,
    "complexity": 0.20,
    "style"     : 0.10,
}

GRADE_THRESHOLDS = [
    (90, "A", "Excellent",        "#22c55e"),
    (75, "B", "Good",             "#84cc16"),
    (60, "C", "Needs Work",       "#eab308"),
    (40, "D", "Poor",             "#f97316"),
    (0,  "F", "Critical Issues",  "#ef4444"),
]


def calculate_score(issues: list) -> dict:
    """
    Calculate weighted overall score and per-category scores.

    Returns:
        {
            overallScore:   int,
            securityScore:  int,
            bugScore:       int,
            complexityScore:int,
            styleScore:     int,
            grade:          str,
            gradeLabel:     str,
            gradeColor:     str,
            breakdown: {
                critical: int,
                high:     int,
                medium:   int,
                low:      int,
            }
        }
    """

    # ── Count issues per category ──────────────────────────
    category_issues = {
        "security"  : [],
        "bug"       : [],
        "complexity": [],
        "style"     : [],
    }

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}

    for issue in issues:
        cat      = issue.get("type", "style")
        severity = issue.get("severity", "low")

        if cat in category_issues:
            category_issues[cat].append(issue)

        if severity in severity_counts:
            severity_counts[severity] += 1

    # ── Calculate per-category score ──────────────────────
    def calc_category_score(issue_list: list) -> int:
        score = 100
        for issue in issue_list:
            severity = issue.get("severity", "low")
            penalty  = SEVERITY_PENALTIES.get(severity, 3)
            score   -= penalty
        return max(0, score)

    security_score   = calc_category_score(category_issues["security"])
    bug_score        = calc_category_score(category_issues["bug"])
    complexity_score = calc_category_score(category_issues["complexity"])
    style_score      = calc_category_score(category_issues["style"])

    # ── Calculate weighted overall score ──────────────────
    overall = (
        security_score   * CATEGORY_WEIGHTS["security"]   +
        bug_score        * CATEGORY_WEIGHTS["bug"]        +
        complexity_score * CATEGORY_WEIGHTS["complexity"] +
        style_score      * CATEGORY_WEIGHTS["style"]
    )
    overall_score = max(0, min(100, round(overall)))

    # ── Get grade ─────────────────────────────────────────
    grade, grade_label, grade_color = _get_grade(overall_score)

    return {
        "overallScore"   : overall_score,
        "securityScore"  : security_score,
        "bugScore"       : bug_score,
        "complexityScore": complexity_score,
        "styleScore"     : style_score,
        "grade"          : grade,
        "gradeLabel"     : grade_label,
        "gradeColor"     : grade_color,
        "breakdown"      : severity_counts,
    }


def _get_grade(score: int) -> tuple:
    for threshold, grade, label, color in GRADE_THRESHOLDS:
        if score >= threshold:
            return grade, label, color
    return "F", "Critical Issues", "#ef4444"