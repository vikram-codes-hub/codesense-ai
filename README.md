# 🔍 CodeSense AI — Automated Code Review Platform

> **AI-powered code reviewer that automatically analyzes every GitHub Pull Request for security vulnerabilities, bugs, and complexity issues — and posts inline comments like a real senior developer, in under 30 seconds.**

<br/>

![CodeSense Banner](https://img.shields.io/badge/CodeSense-AI%20Code%20Reviewer-blue?style=for-the-badge&logo=github)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Redis](https://img.shields.io/badge/Redis-BullMQ-red?style=for-the-badge&logo=redis)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<br/>

## 📌 What is CodeSense?

Most developers wait **hours or days** for a teammate to review their code. CodeSense fixes that.

Connect your GitHub repo once → open any Pull Request → within **30 seconds**, CodeSense:

- ✅ Reads every file in your PR
- ✅ Detects security vulnerabilities, bugs, and complexity issues
- ✅ Posts **inline comments directly on your GitHub PR** — on the exact lines with problems
- ✅ Gives an **overall code quality score** (0–100)
- ✅ Updates your dashboard **live via WebSocket**

---

## 🎬 Demo

```
Developer opens Pull Request on GitHub
              ↓
GitHub sends webhook to CodeSense
              ↓
BullMQ queues the analysis job
              ↓
Python ML Service analyzes every line:
  → security.py   — finds SQL injection on line 12
  → bugs.py       — finds unused variable on line 34
  → complexity.py — flags complex function on line 67
  → style.py      — deep nesting on line 89
              ↓
WebSocket pushes live progress to dashboard
              ↓
GitHub PR gets inline comments automatically:

  Line 12: 🔴 CRITICAL — SQL Injection vulnerability
           User input directly in query.
           Fix: Use parameterized queries

  Line 34: 🔵 LOW — Unused variable 'temp'
           Fix: Remove unused variables

Overall Score: 62 / 100
```

---

## 🏗️ Architecture

```
[GitHub PR / Manual Upload]
         ↓ Webhook / API
[React Frontend] ←── WebSocket ───→ [Node.js Backend]
                                            ↓
                                    [MongoDB]  [Redis]
                                            ↓
                                     [BullMQ Queue]
                                            ↓
                                  [Python Flask ML Service]
                                            ↓
                          ┌─────────────────────────────────┐
                          │  complexity.py  — radon         │
                          │  security.py    — bandit+custom │
                          │  bugs.py        — AST parsing   │
                          │  style.py       — pattern rules │
                          └─────────────────────────────────┘
                                            ↓
                                [GitHub API — post comments]
```

---

## ✨ Features

### 🔐 Security Analysis
- SQL Injection detection
- XSS vulnerability detection
- Hardcoded passwords / API keys / secrets
- Unsafe `eval()` and `exec()` usage
- Weak cryptography (MD5, SHA1)
- Command injection risks
- Unsafe deserialization

### 🐛 Bug Detection
- Unused variables
- Null pointer risks
- Unreachable code
- Missing error handling
- Infinite loop risks
- Type mismatch patterns

### 🧠 Complexity Scoring
- Cyclomatic complexity per function (via Radon)
- Cognitive complexity scoring
- Flags functions with complexity > 10
- Deep nesting detection (> 4 levels)

### ✨ Style Issues
- Functions too long (> 50 lines)
- Magic numbers in code
- Missing error handling blocks
- Inconsistent patterns

### 🔴 Severity Levels
| Badge | Level | Score Penalty |
|-------|-------|---------------|
| 🔴 | Critical | -25 points |
| 🟡 | High | -15 points |
| 🟠 | Medium | -8 points |
| 🔵 | Low | -3 points |

---

## 🛠️ Tech Stack

### Backend — Node.js
| Technology | Purpose |
|------------|---------|
| Express.js | REST API server |
| MongoDB + Mongoose | Database |
| Redis + ioredis | Caching + BullMQ broker |
| BullMQ | Async job queue |
| Socket.IO | Real-time WebSocket updates |
| JWT + bcryptjs | Authentication |
| Passport.js | GitHub OAuth |
| Winston | Logging |

### ML Service — Python
| Technology | Purpose |
|------------|---------|
| Flask | Microservice API |
| Radon | Cyclomatic complexity |
| Bandit | Security vulnerability scanning |
| Pyflakes | Bug detection |
| Esprima | JavaScript AST parsing |
| AST (built-in) | Python code parsing |

### Frontend — React
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| Monaco Editor | VS Code-style code viewer |
| Socket.IO Client | Live updates |
| Axios | HTTP requests |
| Zustand | State management |
| React Router v6 | Routing |
| Chart.js | Score charts |

---

## 📁 Project Structure

```
codesense-ai/
├── codesense-backend/          # Node.js API
│   ├── config/                 # DB, Redis, BullMQ config
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, error, rate limit
│   ├── models/                 # Mongoose schemas
│   ├── queues/                 # BullMQ queue definitions
│   ├── workers/                # BullMQ job processors
│   ├── services/               # GitHub API, ML bridge, webhooks
│   ├── routes/                 # Express route definitions
│   ├── socket/                 # WebSocket event handlers
│   └── utils/                  # JWT, logger, response helpers
│
├── codesense-ml/               # Python Flask ML Service
│   ├── analyzers/              # complexity, security, bugs, style
│   ├── parsers/                # Python + JavaScript AST parsers
│   ├── routes/                 # Flask API endpoints
│   ├── utils/                  # scorer, formatter, logger
│   └── data/                   # security pattern rules JSON
│
└── codesense-frontend/         # React Application
    └── src/
        ├── pages/              # Login, Dashboard, ReviewDetail
        ├── components/         # FileViewer, IssueList, ScoreCard
        ├── hooks/              # useSocket, useReview, useAuth
        ├── context/            # AuthContext, SocketContext
        └── store/              # Zustand state
```

---

## 🚀 Getting Started

### Prerequisites
```
Node.js 18+
Python 3.10+
MongoDB (Atlas or local)
Redis (local or cloud)
GitHub Account
```

### 1. Clone the repo
```bash
git clone https://github.com/vikram-codes-hub/codesense-ai.git
cd codesense-ai
```

### 2. Setup Backend
```bash
cd codesense-backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Setup ML Service
```bash
cd codesense-ml
python -m venv venv
source venv/Scripts/activate   # Windows
pip install -r requirements.txt
python app.py
```

### 4. Setup Frontend
```bash
cd codesense-frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/github              ← GitHub OAuth

GET    /api/repos                    ← connected repos
POST   /api/repos/connect            ← connect GitHub repo

GET    /api/reviews                  ← all reviews
GET    /api/reviews/:id              ← review with all issues
POST   /api/reviews/manual           ← manual code upload

GET    /api/dashboard/stats          ← user statistics

POST   /api/webhook/github           ← GitHub webhook receiver
```

---

## 📡 WebSocket Events

```
Server → Client:
  review:queued      { reviewId, prTitle }
  review:started     { reviewId, totalFiles }
  review:file:done   { reviewId, filename, score }
  review:complete    { reviewId, overallScore, summary }
  review:failed      { reviewId, error }

Client → Server:
  subscribe:review   { reviewId }
```

---

## 🏆 Scoring System

```
Overall Score = weighted average:
  Security Score   → 40% weight
  Bug Score        → 30% weight
  Complexity Score → 20% weight
  Style Score      → 10% weight

Score = 100 - (sum of all issue penalties)
Minimum score: 0 | Maximum score: 100
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway |
| ML Service | Render |
| Database | MongoDB Atlas |
| Redis | Railway Plugin |

---

## 🗺️ Roadmap

- [x] Project architecture & structure
- [ ] Backend API (auth, repos, reviews)
- [ ] Python ML analyzers
- [ ] GitHub Webhook integration
- [ ] BullMQ queue + workers
- [ ] React frontend
- [ ] GitHub OAuth
- [ ] Inline PR comments via GitHub API
- [ ] Live WebSocket dashboard
- [ ] Deploy to production
- [ ] TypeScript support analysis
- [ ] Java language support

---

## 👨‍💻 Author

**Vikram Singh Gangwar**
- GitHub: [@vikram-codes-hub](https://github.com/vikram-codes-hub)
- LinkedIn: [vikram-singh-gangwar](https://linkedin.com/in/vikram-singh-gangwar)
- Portfolio: [your-portfolio-link]

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
  <br/>
  <sub>Built with ❤️ by Vikram Singh Gangwar</sub>
</div>