from flask import Blueprint, jsonify
import datetime

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success"  : True,
        "status"   : "ok",
        "service"  : "CodeSense ML Service",
        "version"  : "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "analyzers": ["complexity", "security", "bugs", "style"],
        "languages": ["python", "javascript"],
    }), 200