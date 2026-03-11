from flask import Blueprint, request, jsonify
from analyzers.complexity import analyze_complexity
from analyzers.security   import analyze_security
from analyzers.bugs       import analyze_bugs
from analyzers.style      import analyze_style
from utils.scorer         import calculate_score
from utils.formatter      import format_response
from utils.logger         import get_logger

logger      = get_logger(__name__)
analyze_bp  = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        # ── Validate input ────────────────────────────────
        if not data:
            return jsonify({ "error": "No data provided" }), 400

        if "code" not in data or "language" not in data:
            return jsonify({ "error": "Please provide code and language" }), 400

        code     = data["code"]
        language = data["language"].lower().strip()
        filename = data.get("filename", "unknown")

        if not code.strip():
            return jsonify({ "error": "Code cannot be empty" }), 400

        if language not in ["python", "javascript", "typescript", "js", "ts", "py"]:
            return jsonify({ "error": f"Unsupported language: {language}. Supported: python, javascript" }), 400

        # Normalize language
        if language in ["js", "typescript", "ts"]:
            language = "javascript"
        if language == "py":
            language = "python"

        logger.info(f"Analyzing {filename} ({language}) — {len(code.splitlines())} lines")

        # ── Run all 4 analyzers ───────────────────────────
        complexity_issues = analyze_complexity(code, language)
        security_issues   = analyze_security(code, language)
        bug_issues        = analyze_bugs(code, language)
        style_issues      = analyze_style(code, language)

        all_issues = complexity_issues + security_issues + bug_issues + style_issues

        logger.info(f"Found {len(all_issues)} issues in {filename}")

        # ── Calculate score ───────────────────────────────
        score = calculate_score(all_issues)

        # ── Format and return ─────────────────────────────
        response = format_response(
            filename   = filename,
            language   = language,
            issues     = all_issues,
            score      = score,
            total_lines= len(code.splitlines()),
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({ "error": str(e) }), 500


@analyze_bp.route("/analyze/batch", methods=["POST"])
def analyze_batch():
    """Analyze multiple files at once"""
    try:
        data = request.get_json()

        if not data or "files" not in data:
            return jsonify({ "error": "Please provide files array" }), 400

        files   = data["files"]
        results = []

        for file in files:
            code     = file.get("code", "")
            language = file.get("language", "javascript").lower()
            filename = file.get("filename", "unknown")

            if not code.strip():
                continue

            # Normalize
            if language in ["js", "typescript", "ts"]:
                language = "javascript"
            if language == "py":
                language = "python"

            complexity_issues = analyze_complexity(code, language)
            security_issues   = analyze_security(code, language)
            bug_issues        = analyze_bugs(code, language)
            style_issues      = analyze_style(code, language)

            all_issues = complexity_issues + security_issues + bug_issues + style_issues
            score      = calculate_score(all_issues)

            results.append(format_response(
                filename    = filename,
                language    = language,
                issues      = all_issues,
                score       = score,
                total_lines = len(code.splitlines()),
            ))

        logger.info(f"Batch analyzed {len(results)} files")
        return jsonify({ "success": True, "files": results, "totalFiles": len(results) }), 200

    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        return jsonify({ "error": str(e) }), 500