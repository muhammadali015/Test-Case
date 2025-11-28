# 🧪 AI Test Case Generator Agent

A fully functional AI-powered agent that generates comprehensive test cases from source code. Built to comply with **Supervisor/Registry communication protocols**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5-purple)
![Deployed](https://img.shields.io/badge/Render-Deployed-success)

## 🌐 Live Demo

**Agent URL:** [https://test-case-ks9p.onrender.com](https://test-case-ks9p.onrender.com)

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
    "test_cases": {...},
    "coverage_analysis": "...",
    "recommendations": "..."
  },
  "timestamp": "ISO-8601"
}
```

---

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web UI - Supervisor Chat Console |
| `/health` | GET | Health check - returns agent status |
| `/execute` | POST | Main endpoint - accepts task assignments |
| `/api/status` | GET | API status information |

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

## 📊 Detailed Output Example

### Full Request
```bash
curl -X POST https://test-case-ks9p.onrender.com/execute \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": "sup-001",
    "sender": "supervisor",
    "recipient": "testcase_generator_agent",
    "type": "task_assignment",
    "timestamp": "2025-01-15T10:30:00Z",
    "results/task": {
      "task_type": "generate_test_cases",
      "language": "javascript",
      "payload": {
        "api": "/api/users/register",
        "method": "POST",
        "fields": ["username", "email", "password"],
        "requires_auth": false
      }
    }
  }'
```

### Full Response
```json
{
  "message_id": "test-agent-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "sender": "testcase_generator_agent",
  "recipient": "supervisor",
  "type": "task_response",
  "related_message_id": "sup-001",
  "status": "completed",
  "results/task": {
    "status_message": "Generated 12 test cases for POST /api/users/register",
    "generated_test_cases": [
      {
        "description": "Valid input returns success response",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "email": "user@example.com",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 201,
          "message": "Request processed successfully"
        }
      },
      {
        "description": "Missing username triggers validation error",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "email": "user@example.com",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "username is required"
        }
      },
      {
        "description": "Missing email triggers validation error",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "email is required"
        }
      },
      {
        "description": "Missing password triggers validation error",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "email": "user@example.com"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "password is required"
        }
      },
      {
        "description": "Invalid data type for username",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": 999999,
            "email": "user@example.com",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "username must be a valid string"
        }
      },
      {
        "description": "Invalid data type for email",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "email": 999999,
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "email must be a valid string"
        }
      },
      {
        "description": "username set to empty string",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "",
            "email": "user@example.com",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "username cannot be empty"
        }
      },
      {
        "description": "email set to empty string",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "email": "",
            "password": "Str0ngP@ss!"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "email cannot be empty"
        }
      },
      {
        "description": "password set to special characters",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "test_user",
            "email": "user@example.com",
            "password": "!@#$%^&*()__TEST__"
          }
        },
        "expected": {
          "status_code": 400,
          "message": "password contains unsupported characters"
        }
      },
      {
        "description": "Calling GET /api/users/register should return method not allowed",
        "input": {
          "api": "/api/users/register",
          "method": "GET"
        },
        "expected": {
          "status_code": 405,
          "message": "Method Not Allowed"
        }
      },
      {
        "description": "Empty request body should fail validation",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {}
        },
        "expected": {
          "status_code": 400,
          "message": "Body cannot be empty"
        }
      },
      {
        "description": "Alternative valid input variation returns success",
        "input": {
          "api": "/api/users/register",
          "method": "POST",
          "body": {
            "username": "John Doe",
            "email": "test2@example.com",
            "password": "Str0ngP@ss!"
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
      "api": "/api/users/register",
      "method": "POST",
      "scenarios_count": 12
    },
    "coverage_analysis": "{\"api\":\"/api/users/register\",\"method\":\"POST\",\"total_generated_tests\":12,\"fields\":[\"username\",\"email\",\"password\"],\"covered_scenarios\":[\"happy_path\",\"missing_required_fields\",\"invalid_types\",\"http_method_mismatch\",\"empty_body\"],\"missing_scenarios\":[],\"notes\":\"Coverage is inferred from generated scenarios only.\"}",
    "recommendations": "Use the generated jest+supertest suite as a starting point and refine assertions to match your actual response schema for POST /api/users/register. Add integration tests that hit the real database. Introduce tests for failure modes of external services. Consider splitting the generated suite into route-specific files.",
    "ltm_hit": false
  },
  "timestamp": "2025-01-15T10:30:05.123Z"
}
```

---

## 🎯 Generated Test Case Schema

Each test case follows this exact structure:

```json
{
  "description": "Human-readable test description",
  "input": {
    "api": "/endpoint/path",
    "method": "POST|GET|PUT|DELETE|PATCH",
    "headers": {
      "Authorization": "Bearer token"
    },
    "body": {
      "field1": "value1",
      "field2": "value2"
    }
  },
  "expected": {
    "status_code": 200,
    "message": "Expected response message"
  }
}
```

---

## 🔧 Test Scenarios Generated

| Scenario Type | Description |
|---------------|-------------|
| ✅ **Happy Path** | Valid input returns success |
| ❌ **Missing Fields** | Each required field missing |
| ⚠️ **Invalid Types** | Wrong data types for fields |
| 📏 **Boundary Values** | Empty, max length, special chars |
| 🔐 **Auth Tests** | Missing/invalid authorization |
| 🚫 **Method Mismatch** | Wrong HTTP method (405) |
| 📭 **Empty Body** | Empty request body |

---

## 🔧 Supported Test Frameworks

| Language | Framework | Output File |
|----------|-----------|-------------|
| JavaScript/TypeScript | Jest + Supertest | `*.test.js` |
| Python | pytest | `test_*.py` |
| Java | JUnit 5 | `Test*.java` |
| PHP | PHPUnit | `*Test.php` |
| Go | testing | `*_test.go` |

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Create .env file
PORT=3000
GEMINI_API_KEY=your_api_key
```

### 3. Start Server
```bash
npm start
```

### 4. Access
- **UI**: http://localhost:3000
- **Health**: http://localhost:3000/health

---

## 🧪 Running Integration Tests

```bash
npm test
```

Tests verify:
- ✅ Health Check Endpoint
- ✅ Supervisor Handshake Protocol
- ✅ Test Case Generation
- ✅ Error Handling
- ✅ Input Validation

---

## 🛡️ Features

- **AI-Powered**: Uses Google Gemini 2.5 for intelligent test generation
- **Multi-Source Input**: Git repos, ZIP files, or individual files
- **Auto-Detection**: Automatically detects endpoints from code
- **LTM Caching**: Long-term memory to avoid redundant API calls
- **Rate Limiting**: 10 requests per minute protection
- **Multi-Framework**: Generates tests for 5+ frameworks

---

## 📝 License

ISC License

## 👤 Author

Muhammad Ali

---

## 🔗 Links

- **Live Agent**: [https://test-case-generator-agent.onrender.com](https://test-case-generator-agent.onrender.com/)
- **GitHub**: [https://github.com/muhammadali015/Test-Case](https://github.com/muhammadali015/Test-Case)
