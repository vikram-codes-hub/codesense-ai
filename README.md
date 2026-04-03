# 🔍 CodeSense AI — Automated Code Review Platform

> **AI-powered code reviewer that automatically analyzes every GitHub Pull Request for security vulnerabilities, bugs, and complexity issues — posts inline comments like a senior developer, and generates AI-powered fixes using Gemini — in under 30 seconds.**

<br/>

![CodeSense Banner](https://img.shields.io/badge/CodeSense-AI%20Code%20Reviewer-blue?style=for-the-badge&logo=github)
![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=for-the-badge&logo=nodedotjs)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Redis](https://img.shields.io/badge/Redis-BullMQ-red?style=for-the-badge&logo=redis)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<br/>

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ **Frontend** | [codesense-ai-2mqt.vercel.app](https://codesense-ai-2mqt.vercel.app) |
| ⚙️ **Backend API** | [codesense-ai-production.up.railway.app](https://codesense-ai-production-4a5b.up.railway.app/api/health) |
| 🤖 **ML Service** | [codesense-ai-fifb.onrender.com](https://codesense-ai-fifb.onrender.com) |

---

## 📌 What is CodeSense?

Most developers wait **hours or days** for a teammate to review their code. CodeSense fixes that.

Connect your GitHub repo once → open any Pull Request → within **30 seconds**, CodeSense:

- ✅ Reads every changed file in your PR
- ✅ Detects **150+ security vulnerabilities**, bugs, and complexity issues
- ✅ Posts **inline comments directly on your GitHub PR** — on the exact lines with problems
- ✅ Gives an **overall code quality score** (0–100) with grade breakdown
- ✅ Updates your dashboard **live via WebSocket**
- ✅ Generates **AI-powered fix suggestions** using Gemini (with Grok fallback)

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
           💡 Fix: Use parameterized queries: db.query('WHERE id = ?', [id])

  Line 6:  🔴 CRITICAL — Hardcoded API key detected
           Fix: Use environment variables: process.env.API_KEY

Overall Score: 46 / 100 — Grade D (Poor)

              ↓
Click "⚡ AI Fix" on any issue:
  → Gemini AI explains the exact danger in context
  → Shows corrected code with confidence score
  → Falls back to Grok if Gemini unavailable
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub                                   │
│   Pull Request → Webhook Event → OAuth Login                │
└──────────────────────┬──────────────────────────────────────┘
                       │ webhook POST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (Railway)                       │
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
│           Python Flask ML Service (Render)                   │
│                                                             │
│  /api/analyze                                               │
│       │                                                     │
│  ┌────┴────────────────────────────────────┐               │
│  │  complexity.py  ← Radon cyclomatic      │               │
│  │  security.py    ← Bandit + 150 patterns │               │
│  │  bugs.py        ← AST parsing           │               │
│  │  style.py       ← Pattern rules         │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                       │ Socket.IO
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              React Frontend (Vercel)                         │
│                                                             │
│  Dashboard → Repositories → Review Detail → Manual Review   │
│       │                           │                         │
│  Live Feed                  Monaco Editor                   │
│  Score Ring                 Issue List                      │
│  Stats Cards                ⚡ AI Fix Button                │
└─────────────────────────────────────────────────────────────┘
                       │ API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Fix Service (Multi-Provider)                 │
│                                                             │
│  Issue detected → Build context prompt                      │
│       │                                                     │
│  Gemini 1.5 Flash (primary, free)                          │
│       ↓ fallback                                           │
│  Grok Beta (xAI)                                           │
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
- Prototype pollution — `__proto__`, constructor manipulation
- Path traversal — user input in file paths
- SSTI — Jinja2 template injection
- JWT vulnerabilities — algorithm:none, missing verification
- Token detection — GitHub `ghp_`, Slack `xoxb-`, Stripe `sk_live_`

### 🐛 Bug Detection
- Unused variables and imports
- Empty catch blocks silently swallowing errors
- Null pointer risks and missing error handling
- Mutable default arguments (Python)
- Type mismatches and loose equality

### 🧠 Complexity Scoring
- Cyclomatic complexity per function via Radon
- Flags functions with complexity > 10
- Deep nesting detection (> 4 levels)
- Functions too long (> 50 lines)

### 🤖 AI Fix Suggestions
- Click **⚡ AI Fix** on any detected issue
- Gemini 1.5 Flash explains WHY it's dangerous in context
- Provides corrected code snippet with confidence score
- Automatic fallback: Gemini → Grok
- Results cached in MongoDB — no repeated API calls

### 🔴 Severity System
| Badge | Level | Score Penalty |
|-------|-------|---------------|
| 🔴 | Critical | -25 points |
| 🟠 | High | -15 points |
| 🟡 | Medium | -8 points |
| 🔵 | Low | -3 points |

---

## 🛠️ Tech Stack

### Backend — Node.js
| Technology | Purpose |
|------------|---------|
| Express.js | REST API server |
| MongoDB + Mongoose | Database & schemas |
| Redis Cloud + ioredis | Queue broker + caching |
| BullMQ | Async job queue with retry |
| Socket.IO | Real-time WebSocket events |
| JWT + bcryptjs | Authentication |
| Passport.js | GitHub OAuth 2.0 |
| Axios | GitHub API + ML service calls |
| Winston | Structured logging |

### ML Service — Python
| Technology | Purpose |
|------------|---------|
| Flask + Flask-CORS | Microservice REST API |
| Gunicorn | Production WSGI server |
| Radon | Cyclomatic complexity analysis |
| Bandit | Security vulnerability scanning |
| Pyflakes | Bug detection |
| Esprima | JavaScript AST parsing |
| AST (built-in) | Python code structure parsing |

### Frontend — React
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework |
| Monaco Editor | VS Code-style code viewer with markers |
| Socket.IO Client | Live review progress updates |
| Axios | HTTP client with auth interceptors |
| Zustand | Lightweight state management |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### AI Services
| Provider | Role | Model |
|----------|------|-------|
| Google Gemini | Primary AI fix provider | gemini-1.5-flash |
| xAI Grok | Fallback AI provider | grok-beta |

---

## 📁 Project Structure

```
codesense-ai/
├── codesense-backend/
│   ├── config/
│   │   ├── db.js               ← MongoDB connection
│   │   ├── redis.js            ← Redis Cloud connection
│   │   ├── bullmq.js           ← BullMQ connection config
│   │   └── Passport.js         ← GitHub OAuth strategy
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── repo.controller.js
│   │   ├── review.controller.js ← includes getAIFix
│   │   ├── dashboard.controller.js
│   │   └── webhook.controller.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Repository.js
│   │   ├── Review.js
│   │   ├── ReviewFile.js
│   │   └── Issue.js             ← includes AI fix fields
│   ├── queues/
│   │   ├── review.queue.js
│   │   └── github.queue.js
│   ├── workers/
│   │   ├── review.worker.js     ← ML analysis pipeline
│   │   └── github.worker.js     ← GitHub comments posting
│   ├── services/
│   │   ├── ai.service.js        ← Gemini + Grok multi-provider
│   │   ├── mlBridge.service.js  ← Python ML service client
│   │   ├── webhook.service.js   ← PR event processing
│   │   └── github.service.js    ← GitHub API wrapper
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── repo.routes.js
│   │   ├── review.routes.js
│   │   ├── dashboard.routes.js
│   │   └── webhook.routes.js
│   ├── socket/
│   │   └── index.js             ← Socket.IO event handlers
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── Tests/
│   │   ├── webhook.service.test.js
│   │   ├── review.worker.test.js
│   │   └── auth.controller.test.js
│   └── utils/
│       ├── logger.js
│       ├── jwt.utils.js
│       └── response.utils.js
│
├── codesense-ml/
│   ├── analyzers/
│   │   ├── complexity.py        ← Radon cyclomatic complexity
│   │   ├── security.py          ← 150+ pattern detection
│   │   ├── bugs.py              ← AST-based bug detection
│   │   └── style.py             ← Style rule analysis
│   ├── parsers/
│   │   ├── python_parser.py
│   │   └── javascript_parser.py
│   ├── routes/
│   │   ├── analyze.py           ← /api/analyze endpoint
│   │   └── health.py
│   ├── utils/
│   │   ├── scorer.py            ← Score calculation
│   │   └── formatter.py         ← Response formatting
│   └── data/
│       └── security_patterns.json ← 150+ security patterns
│
└── codesense-frontend/
    └── src/
        ├── pages/
        │   ├── Auth.jsx
        │   ├── Dashboard.jsx
        │   ├── Repositories.jsx
        │   ├── ReviewDetail.jsx
        │   ├── ManualReview.jsx
        │   └── Settings.jsx
        ├── components/
        │   ├── review/
        │   │   ├── IssueCard.jsx  ← AI Fix button + display
        │   │   ├── IssueList.jsx
        │   │   ├── ScoreCard.jsx
        │   │   ├── FileViewer.jsx
        │   │   └── LiveFeed.jsx
        │   └── dashboard/
        │       ├── StatsWidget.jsx
        │       └── RecentReviews.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useReview.js      ← includes getAIFix
        │   ├── useRepo.js
        │   └── useSocket.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        └── store/
            ├── authStore.js
            └── reviewStore.js
```

---

## 🚀 Getting Started Locally

### Prerequisites
```
Node.js 18+
Python 3.10+
MongoDB Atlas account (free)
Redis Cloud account (free)
GitHub account
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
```

Create `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_personal_access_token
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
```

```bash
nodemon server.js
```

### 3. Setup ML Service
```bash
cd codesense-ml
pip install -r requirements.txt
python app.py
```

### 4. Setup Frontend
```bash
cd codesense-frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
```

### 5. Expose backend for GitHub webhooks
```bash
ngrok http 5000
# Copy the URL → update GITHUB_CALLBACK_URL in .env
# Add webhook in GitHub repo settings
```

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/register          ← email/password signup
POST   /api/auth/login             ← email/password login
GET    /api/auth/github            ← GitHub OAuth redirect
GET    /api/auth/github/callback   ← GitHub OAuth callback
GET    /api/auth/me                ← get current user
PUT    /api/auth/profile           ← update profile
PUT    /api/auth/password          ← change password
```

### Repositories
```
GET    /api/repos                  ← connected repos
GET    /api/repos/github           ← fetch from GitHub API
POST   /api/repos/connect          ← connect a repo
DELETE /api/repos/:id              ← disconnect repo
```

### Reviews
```
GET    /api/reviews                ← all reviews (paginated)
GET    /api/reviews/:id            ← review + all issues
GET    /api/reviews/:id/files      ← review files with issues
POST   /api/reviews/manual         ← manual code review
DELETE /api/reviews/:id            ← delete review
POST   /api/reviews/:id/issues/:issueId/ai-fix  ← generate AI fix
```

### Dashboard
```
GET    /api/dashboard/stats        ← user statistics
GET    /api/dashboard/recent       ← recent reviews
```

### Webhooks
```
POST   /api/webhook/github         ← GitHub PR webhook receiver
```

---

## 📡 WebSocket Events

```
Server → Client:
  review:queued      { reviewId, prTitle, repoName }
  review:started     { reviewId, totalFiles }
  review:file:done   { reviewId, filename, fileScore, issuesFound }
  review:complete    { reviewId, overallScore, totalIssues, grade }
  review:failed      { reviewId, error }
  review:posted      { reviewId, postedCount }
```

---

## 🏆 Scoring System

```
Overall Score = weighted average of category scores:

  Security Score    × 40%
  Bug Score         × 30%
  Complexity Score  × 20%
  Style Score       × 10%

Each category starts at 100.
Issues deduct points based on severity.
Minimum: 0  |  Maximum: 100

Grade:  A (90-100) | B (75-89) | C (60-74) | D (40-59) | F (0-39)
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | Auto-deploy on push to main |
| Backend | Railway | Auto-deploy on push to main |
| ML Service | Render | Auto-deploy on push to main |
| Database | MongoDB Atlas | Managed cloud |
| Redis | Redis Cloud | Managed cloud |

---

## 🧪 Testing

```bash
cd codesense-backend
npx jest --testPathPattern=Tests --coverage
```

Tests cover:
- Webhook signature verification (valid, invalid, missing)
- Score calculation logic
- Severity counting
- ML service integration mocks
- Auth controller (register, duplicate email, missing fields)

---

## 🗺️ Roadmap

- [x] 3-service microservices architecture
- [x] GitHub OAuth 2.0 authentication
- [x] GitHub webhook integration
- [x] BullMQ async job queue with Redis
- [x] Python ML service (150+ security patterns)
- [x] Real-time Socket.IO dashboard
- [x] Monaco Editor with inline issue markers
- [x] GitHub inline PR comments
- [x] Score breakdown with animated rings
- [x] AI-powered fix suggestions (Gemini + Grok)
- [x] Multi-provider AI fallback resilience
- [x] Full production deployment
- [ ] VS Code extension
- [ ] Self-learning ML from user feedback
- [ ] Analytics dashboard with trend charts
- [ ] Slack/email notifications
- [ ] TypeScript support
- [ ] Java + Go language support
- [ ] Docker Compose for local setup

---

## 👨‍💻 Author

**Vikram Singh Gangwar**
- GitHub: [@vikram-codes-hub](https://github.com/vikram-codes-hub)
- LinkedIn: [vikram-singh-gangwar](https://linkedin.com/in/vikram-singh-gangwar)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
  <br/>
  <sub>Built with ❤️ by Vikram Singh Gangwar</sub>
</div>