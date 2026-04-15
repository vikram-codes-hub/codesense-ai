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

## 🌐 Live Demo

| Service | URL | Platform |
|---------|-----|----------|
| 🖥️ **Frontend** | [codesense-ai-5pvs.vercel.app](https://codesense-ai-5pvs.vercel.app/auth) | Vercel |
| ⚙️ **Backend API** | [codesense-ai-1-d8u8.onrender.com](https://codesense-ai-1-d8u8.onrender.com) | Render |
| 🤖 **ML Service** | [codesense-ai-fifb.onrender.com](https://codesense-ai-fifb.onrender.com) | Render |

> ⚠️ Free tier services may take 30-50 seconds to wake up on first request.

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

## ✨ Features

### 🔐 Security Analysis (150+ patterns)
- SQL Injection — string concatenation in queries
- XSS — innerHTML, dangerouslySetInnerHTML, document.write
- Hardcoded secrets — passwords, API keys, tokens, connection strings
- Unsafe execution — eval(), exec(), Function(), vm.runInContext()
- Command injection — child_process, os.system(), shell=True
- Weak cryptography — MD5, SHA1, Math.random()
- Prototype pollution, Path traversal, SSTI, JWT vulnerabilities
- Token detection — GitHub `ghp_`, Slack `xoxb-`, Stripe `sk_live_`

### 🐛 Bug Detection
- Unused variables, empty catch blocks, null pointer risks
- Missing error handling, mutable default arguments (Python)

### 🧠 Complexity Scoring
- Cyclomatic complexity via Radon, deep nesting detection
- Functions too long, magic numbers

### 🤖 AI Fix Suggestions
- **⚡ AI Fix** button on every detected issue
- Gemini 2.0 Flash explains danger + shows corrected code
- Automatic fallback: Gemini → Groq (Llama 3.3 70B)
- Results cached in MongoDB

### 🔴 Severity System
| Badge | Level | Penalty |
|-------|-------|---------|
| 🔴 | Critical | -25 pts |
| 🟠 | High | -15 pts |
| 🟡 | Medium | -8 pts |
| 🔵 | Low | -3 pts |

---

## 🛠️ Tech Stack

### Backend — Node.js
| Technology | Purpose |
|------------|---------|
| Express.js | REST API |
| MongoDB + Mongoose | Database |
| Redis + BullMQ | Job queue |
| Socket.IO | Real-time events |
| JWT + Passport.js | Auth + GitHub OAuth |
| Winston | Logging |

### ML Service — Python
| Technology | Purpose |
|------------|---------|
| Flask + Gunicorn | API server |
| Radon | Complexity analysis |
| Bandit | Security scanning |
| Esprima + AST | Code parsing |

### Frontend — React
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI |
| Monaco Editor | Code viewer |
| Socket.IO Client | Live updates |
| Zustand | State management |

### AI Services
| Provider | Model | Role |
|----------|-------|------|
| Google Gemini | gemini-2.0-flash | Primary |
| Groq | llama-3.3-70b-versatile | Fallback (free) |

---

## 📁 Project Structure

```
codesense-ai/
├── docker-compose.yml
├── .env
├── .gitignore
├── README.md
├── codesense-backend/
│   ├── Dockerfile
│   ├── controllers/
│   ├── models/          ← Issue.js has AI fix fields
│   ├── queues/
│   ├── workers/
│   ├── services/
│   │   └── ai.service.js  ← Gemini + Groq
│   ├── routes/
│   ├── socket/
│   └── Tests/
├── codesense-ml/
│   ├── Dockerfile
│   ├── analyzers/
│   ├── parsers/
│   └── data/
│       └── security_patterns.json
└── Frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── pages/
        ├── components/
        │   └── review/
        │       └── IssueCard.jsx  ← AI Fix UI
        ├── hooks/
        └── store/
```

---

## 🚀 Getting Started

### Option 1 — Docker (Recommended)

```bash
git clone https://github.com/vikram-codes-hub/codesense-ai.git
cd codesense-ai

# Create .env file with your credentials
cp .env.example .env

# Run all services
docker compose up --build
```

Open http://localhost:3000

### Option 2 — Manual

```bash
# Terminal 1 — Backend
cd codesense-backend && npm install && nodemon server.js

# Terminal 2 — ML Service
cd codesense-ml && pip install -r requirements.txt && python app.py

# Terminal 3 — Frontend
cd Frontend && npm install && npm run dev

# Terminal 4 — Webhook tunnel
ngrok http 5000
```

---

## 🔧 Environment Variables

### Backend
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
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