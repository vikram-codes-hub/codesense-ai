from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import signal

load_dotenv()

from routes.analyze import analyze_bp
from routes.health  import health_bp

app = Flask(__name__)

CORS(app, origins=os.getenv("ALLOWED_ORIGIN", "http://localhost:5000"))

# ── Request size limit (max 1MB) ───────────────────────
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024

# ── Register blueprints ───────────────────────────────────
app.register_blueprint(analyze_bp, url_prefix="/api")
app.register_blueprint(health_bp,  url_prefix="/api")

# ── Error handlers ─────────────────────────────────────────
@app.errorhandler(413)
def request_entity_too_large(error):
    return {"error": "Code file too large (max 1MB)"}, 413

@app.errorhandler(500)
def internal_error(error):
    return {"error": "Internal server error"}, 500

if __name__ == "__main__":
    port  = int(os.getenv("PORT", 8000))
    debug = os.getenv("NODE_ENV") == "development"  # Only debug in development
    print(f"\n  🐍 CodeSense ML Service running on http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug, threaded=True)