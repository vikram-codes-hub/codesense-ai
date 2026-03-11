from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from routes.analyze import analyze_bp
from routes.health  import health_bp

app = Flask(__name__)

CORS(app, origins=os.getenv("ALLOWED_ORIGIN", "http://localhost:5000"))

# ── Register blueprints ───────────────────────────────────
app.register_blueprint(analyze_bp, url_prefix="/api")
app.register_blueprint(health_bp,  url_prefix="/api")

if __name__ == "__main__":
    port  = int(os.getenv("PORT", 8000))
    debug = os.getenv("NODE_ENV") != "production"
    print(f"\n  🐍 CodeSense ML Service running on http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)