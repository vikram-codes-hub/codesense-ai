from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

CORS(app, origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:5000")])

# Register blueprints
from routes.analyze import analyze_bp
from routes.health import health_bp

app.register_blueprint(analyze_bp, url_prefix="/api")
app.register_blueprint(health_bp, url_prefix="/api")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("NODE_ENV") == "development")