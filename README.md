# 🧪 AI Test Case Generator Agent

A fully functional AI-powered agent that generates comprehensive test cases from source code. Built to comply with **Supervisor/Registry communication protocols**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5-purple)

---

## ✅ Requirements Compliance

| Requirement | Status | Description |
|------------|--------|-------------|
| **Working AI Agent** | ✅ | Fully functional, responds per JSON contract |
| **HTTP API Deployment** | ✅ | Express.js server with REST endpoints |
| **Supervisor Communication** | ✅ | Follows handshake protocol exactly |
| **Logging & Health Check** | ✅ | `/health` endpoint + console logging |
| **Integration Test** | ✅ | Comprehensive test suite included |

---

## 📡 Supervisor Handshake Protocol

### Request (Task Assignment)
```json
{
  "message_id": "uuid",
  "sender": "supervisor",
  "recipient": "testcase_generator_agent",
  "type": "task_assignment",
  "timestamp": "ISO-8601",
  "results/task": {
    "task_type": "generate_test_cases",
    "language": "javascript",
    "payload": {
      "api": "/api/login",
      "method": "POST",
      "fields": ["email", "password"],
      "requires_auth": false
    }
  }
}
```

### Response (Task Response)
```json
{
  "message_id": "uuid",
  "sender": "testcase_generator_agent",
  "recipient": "supervisor",
  "type": "task_response",
  "related_message_id": "original-uuid",
  "status": "completed",
  "results/task": {
    "status_message": "Generated 15 test cases for POST /api/login",
    "generated_test_cases": [...],
    "test_cases": {
      "framework": "jest+supertest",
      "target_language": "javascript",
      "api": "/api/login",
      "method": "POST",
      "scenarios_count": 15
    },
    "coverage_analysis": "...",
    "recommendations": "..."
  },
  "timestamp": "ISO-8601"
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Start the Server
```bash
npm start
```

### 4. Verify It's Running
```bash
curl http://localhost:3000/health
```

Response:
```json
{"status":"I'm up","agent_name":"Testcase Generator Agent (Smart LTM)"}
```

---

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Status check - confirms agent is running |
| `/health` | GET | Health check - returns agent status |
| `/execute` | POST | Main endpoint - accepts task assignments |

---

## 🧪 Running Integration Tests

The project includes a comprehensive integration test suite:

```bash
# Start the server first
npm start

# In another terminal, run tests
npm test
```

Or run directly:
```bash
node tests/integration.test.js
```

### Test Coverage
- ✅ Health Check Endpoint
- ✅ Root Endpoint Status
- ✅ Supervisor Handshake Protocol
- ✅ Test Case Generation
- ✅ Error Handling
- ✅ Input Validation
- ✅ Coverage Analysis

---

## 📥 Input Sources

The agent accepts code from three sources:

### 1. Git Repository
```json
{
  "results/task": {
    "task_type": "generate_test_cases",
    "git_repo_url": "https://github.com/user/repo.git",
    "language": "javascript"
  }
}
```

### 2. ZIP File (Base64)
```json
{
  "results/task": {
    "task_type": "generate_test_cases",
    "zip_file_base64": "UEsDBBQAAAA...",
    "language": "python"
  }
}
```

### 3. Code Files (Base64)
```json
{
  "results/task": {
    "task_type": "generate_test_cases",
    "code_files_base64": [
      {
        "file_path": "routes/auth.js",
        "content_base64": "Y29uc3QgZXhwcmVzcyA9..."
      }
    ],
    "language": "javascript"
  }
}
```

---

## 🎯 Generated Test Case Format

Each test case follows this structure:

```json
{
  "description": "Valid input returns success response",
  "input": {
    "api": "/api/login",
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "body": {
      "email": "user@example.com",
      "password": "Str0ngP@ss!"
    }
  },
  "expected": {
    "status_code": 200,
    "message": "Login successful"
  }
}
```

---

## 🔧 Supported Test Frameworks

The agent generates runnable test files for multiple frameworks:

| Language | Framework | File Extension |
|----------|-----------|----------------|
| JavaScript/TypeScript | Jest + Supertest | `.test.js` |
| Python | pytest | `test_*.py` |
| Java | JUnit 5 | `Test*.java` |
| PHP | PHPUnit | `*Test.php` |
| Go | testing | `*_test.go` |

---

## 🛡️ Features

- **AI-Powered**: Uses Google Gemini 2.5 for intelligent test generation
- **Multi-Source Input**: Git repos, ZIP files, or individual files
- **Auto-Detection**: Automatically detects endpoints from code
- **LTM Caching**: Long-term memory to avoid redundant API calls
- **Rate Limiting**: 10 requests per minute protection
- **Input Validation**: Validates all incoming requests
- **Security**: Path traversal protection for file uploads

---

## 📊 Example Request/Response

### Full Example Request
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": "test-123",
    "sender": "supervisor",
    "recipient": "testcase_generator_agent",
    "type": "task_assignment",
    "timestamp": "2025-01-01T00:00:00Z",
    "results/task": {
      "task_type": "generate_test_cases",
      "language": "javascript",
      "payload": {
        "api": "/api/users",
        "method": "POST",
        "fields": ["email", "password", "name"],
        "requires_auth": true
      }
    }
  }'
```

### Full Example Response
```json
{
  "message_id": "test-agent-a1b2c3d4-...",
  "sender": "testcase_generator_agent",
  "recipient": "supervisor",
  "type": "task_response",
  "related_message_id": "test-123",
  "status": "completed",
  "results/task": {
    "status_message": "Generated 12 test cases for POST /api/users",
    "generated_test_cases": [
      {
        "description": "Valid input returns success response",
        "input": {
          "api": "/api/users",
          "method": "POST",
          "body": {
            "email": "user@example.com",
            "password": "Str0ngP@ss!",
            "name": "name_value"
          }
        },
        "expected": {
          "status_code": 201,
          "message": "Request processed successfully"
        }
      }
    ],
    "test_cases": {
      "framework": "jest+supertest",
      "target_language": "javascript",
      "api": "/api/users",
      "method": "POST",
      "scenarios_count": 12
    },
    "coverage_analysis": "{...}",
    "recommendations": "Use the generated jest+supertest suite...",
    "ltm_hit": false
  },
  "timestamp": "2025-01-01T00:00:01Z"
}
```

---

## 🏗️ Project Structure

```
Test-Case-main/
├── app.js                    # Main server application
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── index.html                # Web UI
├── lib/
│   └── generate_test_files.js  # Multi-framework test file generator
├── tests/
│   └── integration.test.js   # Integration test suite
├── LTM/
│   └── memory.json           # Long-term memory cache
└── tools/
    └── write_ltm.js          # LTM utility
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `GEMINI_API_KEY` | Yes* | Google Gemini API key |
| `NODE_ENV` | No | Environment (production/development) |

*Without API key, agent uses rule-based generation only.

---

## 🚀 Deployment

### Deploy to Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Option 1: One-Click Deploy**
1. Fork this repository to your GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml`
6. Add `GEMINI_API_KEY` in Environment Variables
7. Click "Apply"

**Option 2: Manual Deploy**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-testcase-agent`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable: `GEMINI_API_KEY`
6. Click "Create Web Service"

Your agent will be live at: `https://ai-testcase-agent.onrender.com`

---

### Deploy with Docker

```bash
# Build the image
docker build -t testcase-agent .

# Run the container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key \
  -e NODE_ENV=production \
  testcase-agent
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  testcase-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### Deploy to Other Platforms

**Heroku:**
```bash
heroku create ai-testcase-agent
heroku config:set GEMINI_API_KEY=your_key
git push heroku main
```

**Railway:**
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Add `GEMINI_API_KEY` environment variable
3. Deploy automatically

**Vercel (Serverless):**
> Note: May require modifications for serverless architecture

---

## 📝 License

ISC License

---

## 👤 Author

Muhammad Ali

---

## 🤝 Integration with Supervisor

This agent is designed to work within a multi-agent supervisor system:

1. **Registration**: Agent registers with supervisor on startup
2. **Task Assignment**: Supervisor sends `task_assignment` messages
3. **Task Execution**: Agent processes the task
4. **Task Response**: Agent returns `task_response` with results

The agent follows the exact handshake protocol specified in the system requirements.
