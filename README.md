# 🔍 CodeSense AI — Automated Code Review Platform

> **AI-powered code reviewer that automatically analyzes every GitHub Pull Request for security vulnerabilities, bugs, and complexity issues — posts inline comments like a senior developer, and generates AI-powered fixes using Gemini & Groq — in under 30 seconds.**

<br/>

![CodeSense Banner](https://img.shields.io/badge/CodeSense-AI%20Code%20Reviewer-blue?style=for-the-badge&logo=github)
![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=for-the-badge&logo=nodedotjs)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Redis](https://img.shields.io/badge/Redis-BullMQ-red?style=for-the-badge&logo=redis)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<br/>

## 📚 Table of Contents
- [🌐 Live Demo](#-live-demo)
- [✨ Quick Start](#-quick-start)
- [🎯 Features](#-features)
- [🏗️ Architecture](#-architecture)
- [📦 Tech Stack](#-tech-stack)
- [🛠️ Installation & Setup](#-installation--setup)
- [🔌 GitHub Webhook Configuration](#-github-webhook-configuration)
- [🚀 Deployment](#-deployment)
- [📖 API Documentation](#-api-documentation)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

<br/>

## 🌐 Live Demo

| Service | URL | Platform |
|---------|-----|----------|
| 🖥️ **Frontend** | [codesense-ai-5pvs.vercel.app](https://codesense-ai-2mqt.vercel.app/auth) | Vercel |
| ⚙️ **Backend API** | [codesense-ai-1-d8u8.onrender.com](https://codesense-ai-1-d8u8.onrender.com) | Render |
| 🤖 **ML Service** | [codesense-ai-fifb.onrender.com](https://codesense-ai-fifb.onrender.com) | Render |

> ⚠️ Free tier services may take 30-50 seconds to wake up on first request.

---

## ⚡ Quick Start (5 minutes)

### **Option A: Docker (Recommended - Easiest)**

```bash
# 1. Clone & navigate
git clone https://github.com/vikram-codes-hub/codesense-ai.git
cd codesense-ai

# 2. Copy environment file
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services
docker-compose up -d

# 4. Open application
open http://localhost:3000
```

### **Option B: Local Development**

```bash
# Terminal 1 - Backend
cd codesense-backend && npm install
npm run dev

# Terminal 2 - ML Service
cd codesense-ml && pip install -r requirements.txt
python app.py

# Terminal 3 - Frontend
cd Frontend && npm install
npm run dev

# Terminal 4 - Webhook tunnel (ngrok)
ngrok http 5000  # Keep running!
```

---

## 📌 What is CodeSense?

Most developers wait **hours or days** for a teammate to review their code. CodeSense fixes that.

Connect your GitHub repo once → open any Pull Request → within **30 seconds**, CodeSense:

- ✅ Reads every changed file in your PR
- ✅ Detects **150+ security vulnerabilities**, bugs, and complexity issues
- ✅ Posts **inline comments directly on your GitHub PR** — on the exact lines with problems
- ✅ Gives an **overall code quality score** (0–100) with grade breakdown
- ✅ Updates your dashboard **live via WebSocket**
- ✅ Generates **AI-powered fix suggestions** using Gemini (with Groq fallback)

---

## 🎬 How It Works

```
Developer opens Pull Request on GitHub
              ↓
GitHub sends webhook to CodeSense Backend
              ↓
BullMQ queues the analysis job in Redis
              ↓
Python ML Service analyzes every changed file:
  → security.py    — SQL injection, XSS, hardcoded secrets, eval()
  → bugs.py        — unused vars, missing error handling, null risks
  → complexity.py  — cyclomatic complexity via Radon (flags > 10)
  → style.py       — deep nesting, magic numbers, long functions
              ↓
Socket.IO pushes live progress to React dashboard
              ↓
GitHub PR gets inline comments automatically:

  Line 12: 🔴 CRITICAL — SQL Injection vulnerability
           User input directly concatenated into SQL query.
           Fix: Use parameterized queries

  Line 6:  🔴 CRITICAL — Hardcoded API key detected
           Fix: Use environment variables: process.env.API_KEY

Overall Score: 46 / 100 — Grade D (Poor)

              ↓
Click "⚡ AI Fix" on any issue:
  → Gemini AI explains the exact danger in context
  → Shows corrected code with confidence score
  → Falls back to Groq (Llama 3.3 70B) if Gemini unavailable
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         GitHub                               │
│      Pull Request → Webhook Event → OAuth Login             │
└──────────────────────┬──────────────────────────────────────┘
                       │ webhook POST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Node.js Backend (Render)                           │
│                                                             │
│  Express API ←──── JWT Auth ────→ Passport GitHub OAuth     │
│       │                                                     │
│  BullMQ Queue ──→ Review Worker ──→ GitHub Worker           │
│       │                │                   │                │
│  Redis Cloud      ML Bridge           GitHub API            │
│       │                │           (inline comments)        │
│  MongoDB Atlas    Socket.IO                                 │
│                  (live events)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Python Flask ML Service (Render)                     │
│                                                             │
│  /api/analyze                                               │
│       │                                                     │
│  ┌────┴────────────────────────────────────┐               │
│  │  complexity.py  ← Radon cyclomatic      │               │
│  │  security.py    ← 150+ patterns         │               │
│  │  bugs.py        ← AST parsing           │               │
│  │  style.py       ← Pattern rules         │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                       │ Socket.IO
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           React Frontend (Vercel)                            │
│                                                             │
│  Dashboard → Repositories → Review Detail → Manual Review   │
│       │                           │                         │
│  Live Feed                  Monaco Editor                   │
│  Score Ring                 Issue List                      │
│  Stats Cards                ⚡ AI Fix Button                │
└─────────────────────────────────────────────────────────────┘
                       │ API call
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         AI Fix Service (Multi-Provider)                      │
│                                                             │
│  Gemini 2.0 Flash (primary)                                │
│       ↓ fallback                                           │
│  Groq — Llama 3.3 70B (free, fast)                        │
│       ↓                                                    │
│  Returns: explanation + fixed code + confidence %          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 API Documentation

### Authentication
```bash
# GitHub OAuth Login
GET /api/auth/github

# Get current user
GET /api/auth/me
Headers: { Authorization: "Bearer {jwt_token}" }
```

### Repositories
```bash
# List connected repositories
GET /api/repos

# Connect new repository
POST /api/repos
Body: { repo_url: "github.com/user/repo", access_token: "..." }

# Get repository reviews
GET /api/repos/:repoId/reviews
```

### Reviews & Analysis
```bash
# Get all reviews
GET /api/reviews

# Get review details
GET /api/reviews/:reviewId

# Get issues for a review
GET /api/reviews/:reviewId/issues
```

### Webhook (for GitHub)
```bash
# GitHub sends Pull Request events here
POST /api/webhook/github
Headers: { 
  "X-Hub-Signature-256": "sha256=...",
  "X-GitHub-Event": "pull_request"
}
```

---

## 🎯 Features

### 🔐 Security Analysis (150+ Patterns)
- **SQL Injection** — string concatenation in queries
- **XSS** — innerHTML, dangerouslySetInnerHTML attacks
- **Hardcoded Secrets** — passwords, API keys, tokens
- **Unsafe Execution** — eval(), exec(), Function()
- **Command Injection** — child_process, shell commands
- **Weak Cryptography** — MD5, SHA1, Math.random()
- **JWT Vulnerabilities** — missing verification, weak secrets
- **Prototype Pollution** — unsafe object merging
- **Token Pattern Detection** — GitHub, Slack, Stripe tokens

### 🐛 Bug Detection
✔️ Unused variables  
✔️ Empty catch blocks  
✔️ Null pointer risks  
✔️ Missing error handling  
✔️ Type mismatches  
✔️ Dead code  

### 🧠 Complexity Scoring
✔️ Cyclomatic complexity via Radon  
✔️ Deep nesting detection  
✔️ Functions too long  
✔️ Magic numbers  
✔️ Cognitive complexity  

### 🤖 AI-Powered Fixes
- **⚡ AI Fix** button on every issue
- Explains why code is problematic
- Shows corrected code with examples
- Confidence score (0-100%)
- Provider fallback: Gemini → Groq

### 📊 Real-time Dashboard
- Live PR analysis updates via WebSocket
- Code quality score (0-100)
- Grade breakdown (A-F)
- Issue severity breakdown
- Historical trends
- Performance metrics

### 🔴 Severity System
| Badge | Level | Points Lost |
|-------|-------|------------|
| 🔴 | Critical | -25 pts |
| 🟠 | High | -15 pts |
| 🟡 | Medium | -8 pts |
| 🔵 | Low | -3 pts |

**Scoring Formula:**
```
Score = 100 - (Σ points for all issues)
Grade: A(90-100) | B(80-89) | C(70-79) | D(60-69) | F(<60)
```

---

## 📦 Tech Stack

### Backend — Node.js 22+
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Express.js | REST API |
| Database | MongoDB + Mongoose | Data storage |
| Queue | Redis + BullMQ | Job processing |
| Real-time | Socket.IO | Live updates |
| Auth | JWT + Passport | Security |
| Logging | Winston | Error tracking |

### ML Service — Python 3.10+
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Server | Flask + Gunicorn | Python API |
| Complexity | Radon | Algorithm analysis |
| Security | Custom patterns + Bandit | Vulnerability scanning |
| Parsing | AST + Esprima | Code structure |

### Frontend — React 18
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 + Vite | UI |
| Editor | Monaco Editor | Code viewing |
| State | Zustand | Data management |
| Real-time | Socket.IO Client | Live updates |
| Styling | Tailwind CSS | Design |

### AI Providers
| Provider | Model | Use Case |
|----------|-------|----------|
| Google Gemini | gemini-2.0-flash | Primary AI fixer |
| Groq | llama-3.3-70b-versatile | Fallback (free) |

---

## 🐛 Troubleshooting

### ❌ Webhook not reaching backend

**Problem**: PR created but no analysis starts

**Solutions**:
```bash
# 1. Check ngrok is running and URL matches GitHub webhook
ngrok http 5000

# 2. Restart backend
docker-compose restart codesense-backend

# 3. Check webhook signature
# In GitHub Settings → Webhooks → Recent Deliveries
# Look for 401 Unauthorized errors

# 4. Verify secret matches
grep GITHUB_WEBHOOK_SECRET .env
```

### ❌ Reviews not appearing on PR

**Problem**: Analysis runs but comments don't post

**Solutions**:
```bash
# 1. Check GitHub token permissions
# Token needs: repo, write:repo_hook, read:user

# 2. Verify repository permissions
# Connect repo through CodeSense dashboard first

# 3. Check ML service logs
docker logs codesense-ml -f

# 4. Check MongoDB connection
docker exec codesense-backend npm run test:db
```

### ❌ ML Service timeout

**Problem**: Analysis takes >30 seconds or fails

**Solutions**:
```bash
# 1. Check ML service is healthy
curl http://localhost:8000/api/health

# 2. Monitor ML logs
docker logs codesense-ml -f

# 3. Restart ML service
docker-compose restart codesense-ml

# 4. Check Redis connection
redis-cli -h localhost ping
```

### ❌ Port 5000 already in use

**Problem**: `bind: Only one usage of each socket address`

**Solutions**:
```bash
# 1. Kill process using port
lsof -i :5000  # Find PID
kill -9 <PID>

# 2. Or use different port
PORT=5001 docker-compose up -d backend

# 3. Docker solution
docker-compose down
docker-compose up -d
```

### ❌ MongoDB connection error

**Problem**: Can't connect to MongoDB Atlas

**Solutions**:
```bash
# 1. Check connection string
grep MONGO_URI .env

# 2. Verify IP whitelist in MongoDB Atlas
# Security → Network Access → Add IP Address

# 3. Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/test"
```

---

## 📁 Project Structure

```
codesense-ai/
├── docker-compose.yml          ← Orchestration config
├── .env                        ← Environment variables
├── PROCEDURE.md                ← Detailed workflow
└── README.md                   ← This file

├── codesense-backend/
│   ├── Dockerfile
│   ├── app.js                  ← Express setup
│   ├── server.js               ← Entry point
│   ├── package.json
│   ├── controllers/            ← Request handlers
│   │   ├── auth.controller.js
│   │   ├── webhook.controller.js
│   │   ├── review.controller.js
│   │   └── ...
│   ├── models/                 ← MongoDB schemas
│   │   ├── User.js
│   │   ├── Review.js
│   │   ├── Issue.js
│   │   └── ...
│   ├── queues/                 ← BullMQ jobs
│   │   ├── review.queue.js
│   │   └── github.queue.js
│   ├── workers/                ← Job processors
│   │   ├── review.worker.js
│   │   └── github.worker.js
│   ├── services/               ← Business logic
│   │   ├── webhook.service.js
│   │   ├── ai.service.js       ← Gemini + Groq
│   │   └── ...
│   ├── routes/                 ← URL endpoints
│   ├── middleware/             ← Auth, logging
│   ├── utils/                  ← Helpers
│   └── Tests/                  ← Unit tests

├── codesense-ml/
│   ├── Dockerfile
│   ├── app.py                  ← Flask server
│   ├── requirements.txt
│   ├── analyzers/
│   │   ├── security.py         ← Security scanning
│   │   ├── bugs.py             ← Bug detection
│   │   ├── complexity.py       ← Complexity analysis
│   │   └── style.py            ← Code style
│   ├── parsers/                ← Code parsing
│   │   ├── javascript_parser.py
│   │   ├── python_parser.py
│   │   └── ...
│   ├── routes/                 ← API endpoints
│   └── data/
│       └── security_patterns.json

└── Frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx            ← Entry point
        ├── App.jsx
        ├── pages/              ← Views
        │   ├── Auth.jsx
        │   ├── Dashboard.jsx
        │   ├── ReviewDetail.jsx
        │   └── ...
        ├── components/         ← React components
        │   ├── common/
        │   ├── review/
        │   │   ├── IssueCard.jsx
        │   │   ├── AIFixModal.jsx
        │   │   └── ...
        │   └── ...
        ├── hooks/              ← Custom hooks
        ├── store/              ← Zustand state
        ├── context/            ← Context API
        └── utils/              ← Helpers
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# 1. Fork the repository
git clone https://github.com/YOUR-USERNAME/codesense-ai.git
cd codesense-ai

# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# Edit files...

# 4. Commit and push
git add .
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

**Guidelines**:
- ✅ Follow existing code style
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Keep commits atomic

---

## 📄 License

MIT License — See [LICENSE](LICENSE) file

---

## 🙋 Support

- 📧 **Email**: support@codesense.ai
- 🐛 **Issues**: [GitHub Issues](https://github.com/vikram-codes-hub/codesense-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/vikram-codes-hub/codesense-ai/discussions)
- 📖 **Docs**: [Full Documentation](https://codesense.ai/docs)

---

**Made with ❤️ by the CodeSense Team**

---

## �️ Installation & Setup

### Prerequisites
- **Node.js** v22+
- **Python** 3.10+
- **Docker** & **Docker Compose**
- **MongoDB Atlas** account (free tier available)
- **GitHub OAuth App**
- **API Keys**: Gemini & Groq (for AI features)

### Step 1: Clone Repository

```bash
git clone https://github.com/vikram-codes-hub/codesense-ai.git
cd codesense-ai
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Backend
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codesense
JWT_SECRET=your_super_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx  # Personal access token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# AI Services
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Frontend
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Services

#### **Docker (Recommended)**
```bash
docker-compose up -d
```

Check status:
```bash
docker ps
```

View logs:
```bash
docker-compose logs -f backend
```

#### **Local Development**
```bash
# Terminal 1: Backend
cd codesense-backend && npm install && npm run dev

# Terminal 2: ML Service
cd codesense-ml && pip install -r requirements.txt && python app.py

# Terminal 3: Frontend
cd Frontend && npm install && npm run dev
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000

---

## 🔌 GitHub Webhook Configuration

### Step 1: Create GitHub OAuth App

1. Go to **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: CodeSense
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Copy `Client ID` and `Client Secret` → add to `.env`

### Step 2: Configure Repository Webhook

For each repository you want CodeSense to analyze:

1. Go to **Settings** → **Webhooks** → **Add webhook**
2. Fill in webhook details:
   - **Payload URL**: `http://localhost:5000/api/webhook/github` (local) OR use **ngrok** for localhost
   - **Content type**: `application/json`
   - **Secret**: Same value as `GITHUB_WEBHOOK_SECRET` in `.env`
   - **Events**: Select **Pull requests**
   - **Active**: ✅ Check

3. Click **Add webhook**

### Step 3: Setup ngrok (for local development)

```bash
# Install ngrok
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip

# Start tunnel (in new terminal)
./ngrok http 5000
# You'll get a URL like: https://xxxx.ngrok.io

# Update GitHub webhook with ngrok URL:
# Payload URL: https://xxxx.ngrok.io/api/webhook/github
```

⚠️ **Important**: Keep ngrok running! If it stops, webhooks won't reach your backend.

---

## 🧪 Testing the Setup

### Create a Test PR

```bash
# 1. Create a test branch
git checkout -b test-codesense

# 2. Create a file with intentional issues
cat > test-file.js << 'EOF'
// Security issue: eval() usage
function processData(input) {
  return eval(input);  // ⚠️ Detected!
}

// Performance issue: O(n²) complexity
function findDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {  // ⚠️ Flagged!
      if (arr[i] === arr[j]) console.log('duplicate');
    }
  }
}
EOF

# 3. Commit and push
git add .
git commit -m "Test CodeSense analysis"
git push origin test-codesense

# 4. Create PR on GitHub
# CodeSense will analyze within 2-5 minutes
```

### Monitor Analysis

```bash
# Watch backend logs for webhook events
docker logs codesense-backend -f

# You should see:
# POST /api/webhook/github 200
# Processing PR...
# Review completed
```

---

## 🚀 Deployment

### Deploying to Production

#### **Option 1: Heroku (Free alternative)**

```bash
# Install Heroku CLI
heroku login

# Create apps
heroku create codesense-backend
heroku create codesense-ml-service

# Set environment variables
heroku config:set MONGO_URI=... GITHUB_TOKEN=... etc

# Deploy
git push heroku main
```

#### **Option 2: AWS, DigitalOcean, or VPS**

1. **Update webhook URL**: Replace with your domain
   - GitHub Settings → Webhooks → Update Payload URL to: `https://yourdomain.com/api/webhook/github`

2. **Install Docker** on your server

3. **Deploy:**
```bash
git clone repo
docker-compose -f docker-compose.prod.yml up -d
```

#### **Environment Variables for Production**

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://prod-user:pass@prod-cluster.mongodb.net/codesense
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
CLIENT_URL=https://yourdomain.com
ML_SERVICE_URL=https://ml.yourdomain.com  # or https://yourdomain.com/ml
```
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_personal_access_token
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔌 API Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/github
GET    /api/repos
POST   /api/repos/connect
GET    /api/reviews
GET    /api/reviews/:id
GET    /api/reviews/:id/files
POST   /api/reviews/manual
POST   /api/reviews/:id/issues/:issueId/ai-fix
GET    /api/dashboard/stats
POST   /api/webhook/github
```

---

## 📡 WebSocket Events

```
review:queued      → review added to queue
review:started     → analysis began
review:file:done   → one file analyzed
review:complete    → all files done, score ready
review:failed      → analysis error
review:posted      → GitHub comments posted
```

---

## 🏆 Scoring

```
Security  × 40% + Bugs × 30% + Complexity × 20% + Style × 10%
Grade: A (90+) | B (75+) | C (60+) | D (40+) | F (<40)
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| ML Service | Render |
| Database | MongoDB Atlas |
| Redis | Redis Cloud |

---

## 🧪 Testing

```bash
cd codesense-backend
npx jest --testPathPattern=Tests --coverage
```

---

## 🗺️ Roadmap

- [x] 3-service microservices architecture
- [x] GitHub OAuth + Webhook integration
- [x] BullMQ async job queue
- [x] Python ML service (150+ patterns)
- [x] Real-time Socket.IO dashboard
- [x] Monaco Editor with issue markers
- [x] GitHub inline PR comments
- [x] AI fix suggestions (Gemini + Groq)
- [x] Multi-provider AI fallback
- [x] Full production deployment
- [x] Docker Compose
- [x] Jest unit tests

---

## 👨‍💻 Author

**Vikram Singh Gangwar**
- GitHub: [@vikram-codes-hub](https://github.com/vikram-codes-hub)
- LinkedIn: [vikram-singh-gangwar](https://linkedin.com/in/vikram-singh-gangwar)

---

## 📄 License

MIT License

---

<div align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
  <br/>
  <sub>Built with ❤️ by Vikram Singh Gangwar</sub>
</div>
