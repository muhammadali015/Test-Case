/**
 * Multi-Framework Test File Generator
 * Generates runnable test files for various testing frameworks:
 * - Jest + Supertest (JavaScript/TypeScript)
 * - pytest (Python)
 * - JUnit5 (Java)
 * - PHPUnit (PHP)
 * - NUnit (C#)
 * - Go testing (Go)
 */

function escapeSingleQuotes(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeDoubleQuotes(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ==================== JEST + SUPERTEST (JavaScript/TypeScript) ====================
function buildJestTestFile(testCases, payload) {
  const lines = [];
  lines.push("const request = require('supertest');");
  lines.push("const app = require('../app');");
  lines.push("");
  lines.push(`describe('Generated test suite for ${payload.method} ${payload.api}', () => {`);

  if (!testCases || testCases.length === 0) {
    const fallbackMethod = (payload && payload.method) ? payload.method.toLowerCase() : 'get';
    const fallbackApi = (payload && payload.api) || '/health';
    lines.push("  test('smoke test: endpoint responds without crashing', async () => {");
    lines.push(`    const res = await request(app).${fallbackMethod}('${fallbackApi}');`);
    lines.push("    expect(res.status).toBeGreaterThanOrEqual(200);");
    lines.push("    expect(res.status).toBeLessThan(600);");
    lines.push("  });");
    lines.push("");
  }

  testCases.forEach((tc, idx) => {
    const desc = tc.description ? escapeSingleQuotes(tc.description) : `case-${idx}`;
    const input = tc.input || tc;
    const method = (input.method || (payload && payload.method) || 'POST').toUpperCase();
    const api = input.api || (payload && payload.api) || '/';
    const headers = input.headers || {};
    const body = input.body === undefined ? null : input.body;
    const expected = tc.expected || {};

    lines.push(`  test('${desc}', async () => {`);
    lines.push(`    let req = request(app).${method.toLowerCase()}('${api}');`);
    if (body !== null && method !== 'GET') {
      lines.push(`    req = req.send(${JSON.stringify(body, null, 2).split('\n').join('\n    ')});`);
    }
    for (const [k, v] of Object.entries(headers)) {
      lines.push(`    req = req.set(${JSON.stringify(k)}, ${JSON.stringify(v)});`);
    }
    lines.push(`    const res = await req;`);
    if (typeof expected.status_code === 'number') {
      lines.push(`    expect(res.status).toBe(${expected.status_code});`);
    }
    if (expected.message) {
      lines.push(`    // Check response contains expected message`);
      lines.push(`    expect(JSON.stringify(res.body)).toContain(${JSON.stringify(String(expected.message))});`);
    }
    lines.push(`  });`);
    lines.push("");
  });

  lines.push('});');
  lines.push("");
  return lines.join('\n');
}

// ==================== PYTEST (Python) ====================
function buildPytestTestFile(testCases, payload) {
  const lines = [];
  lines.push('"""');
  lines.push(`Auto-generated pytest test suite for ${payload.method} ${payload.api}`);
  lines.push('"""');
  lines.push("import pytest");
  lines.push("import requests");
  lines.push("");
  lines.push("# Configure base URL - update this for your environment");
  lines.push("BASE_URL = 'http://localhost:3000'");
  lines.push("");
  lines.push("");

  if (!testCases || testCases.length === 0) {
    lines.push("def test_smoke_endpoint_responds():");
    lines.push(`    """Smoke test: endpoint responds without crashing"""`);
    lines.push(`    response = requests.${(payload.method || 'get').toLowerCase()}(f"{BASE_URL}${payload.api || '/health'}")`);
    lines.push("    assert 200 <= response.status_code < 600");
    lines.push("");
  }

  testCases.forEach((tc, idx) => {
    const desc = tc.description || `case_${idx}`;
    const funcName = `test_${desc.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 50)}`;
    const input = tc.input || tc;
    const method = (input.method || payload.method || 'POST').toLowerCase();
    const api = input.api || payload.api || '/';
    const headers = input.headers || {};
    const body = input.body === undefined ? null : input.body;
    const expected = tc.expected || {};

    lines.push(`def ${funcName}():`);
    lines.push(`    """${escapeDoubleQuotes(desc)}"""`);
    
    if (Object.keys(headers).length > 0) {
      lines.push(`    headers = ${JSON.stringify(headers)}`);
    }
    
    if (body !== null && method !== 'get') {
      lines.push(`    payload = ${JSON.stringify(body, null, 4).split('\n').join('\n    ')}`);
      if (Object.keys(headers).length > 0) {
        lines.push(`    response = requests.${method}(f"{BASE_URL}${api}", json=payload, headers=headers)`);
      } else {
        lines.push(`    response = requests.${method}(f"{BASE_URL}${api}", json=payload)`);
      }
    } else {
      if (Object.keys(headers).length > 0) {
        lines.push(`    response = requests.${method}(f"{BASE_URL}${api}", headers=headers)`);
      } else {
        lines.push(`    response = requests.${method}(f"{BASE_URL}${api}")`);
      }
    }
    
    if (typeof expected.status_code === 'number') {
      lines.push(`    assert response.status_code == ${expected.status_code}`);
    }
    if (expected.message) {
      lines.push(`    assert "${escapeDoubleQuotes(expected.message)}" in response.text`);
    }
    lines.push("");
    lines.push("");
  });

  return lines.join('\n');
}

// ==================== JUNIT5 (Java) ====================
function buildJUnitTestFile(testCases, payload) {
  const className = `Test${(payload.api || '/api').replace(/[^a-zA-Z0-9]/g, '')}`;
  const lines = [];
  
  lines.push("package com.example.tests;");
  lines.push("");
  lines.push("import org.junit.jupiter.api.Test;");
  lines.push("import org.junit.jupiter.api.DisplayName;");
  lines.push("import static org.junit.jupiter.api.Assertions.*;");
  lines.push("import java.net.http.HttpClient;");
  lines.push("import java.net.http.HttpRequest;");
  lines.push("import java.net.http.HttpResponse;");
  lines.push("import java.net.URI;");
  lines.push("");
  lines.push("/**");
  lines.push(` * Auto-generated JUnit5 test suite for ${payload.method} ${payload.api}`);
  lines.push(" */");
  lines.push(`public class ${className} {`);
  lines.push("");
  lines.push("    private static final String BASE_URL = \"http://localhost:3000\";");
  lines.push("    private final HttpClient client = HttpClient.newHttpClient();");
  lines.push("");

  if (!testCases || testCases.length === 0) {
    lines.push("    @Test");
    lines.push("    @DisplayName(\"Smoke test: endpoint responds\")");
    lines.push("    void testSmokeEndpointResponds() throws Exception {");
    lines.push(`        HttpRequest request = HttpRequest.newBuilder()`);
    lines.push(`            .uri(URI.create(BASE_URL + "${payload.api || '/health'}"))`);
    lines.push(`            .GET()`);
    lines.push(`            .build();`);
    lines.push("        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());");
    lines.push("        assertTrue(response.statusCode() >= 200 && response.statusCode() < 600);");
    lines.push("    }");
  }

  testCases.forEach((tc, idx) => {
    const desc = tc.description || `case ${idx}`;
    const methodName = `test${idx}_${desc.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)}`;
    const input = tc.input || tc;
    const method = (input.method || payload.method || 'POST').toUpperCase();
    const api = input.api || payload.api || '/';
    const headers = input.headers || {};
    const body = input.body === undefined ? null : input.body;
    const expected = tc.expected || {};

    lines.push("");
    lines.push("    @Test");
    lines.push(`    @DisplayName("${escapeDoubleQuotes(desc)}")`);
    lines.push(`    void ${methodName}() throws Exception {`);
    
    if (body !== null && method !== 'GET') {
      lines.push(`        String jsonBody = ${JSON.stringify(JSON.stringify(body))};`);
      lines.push(`        HttpRequest request = HttpRequest.newBuilder()`);
      lines.push(`            .uri(URI.create(BASE_URL + "${api}"))`);
      lines.push(`            .header("Content-Type", "application/json")`);
      for (const [k, v] of Object.entries(headers)) {
        lines.push(`            .header("${k}", "${v}")`);
      }
      lines.push(`            .${method}(HttpRequest.BodyPublishers.ofString(jsonBody))`);
      lines.push(`            .build();`);
    } else {
      lines.push(`        HttpRequest request = HttpRequest.newBuilder()`);
      lines.push(`            .uri(URI.create(BASE_URL + "${api}"))`);
      for (const [k, v] of Object.entries(headers)) {
        lines.push(`            .header("${k}", "${v}")`);
      }
      lines.push(`            .${method}(HttpRequest.BodyPublishers.noBody())`);
      lines.push(`            .build();`);
    }
    
    lines.push("        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());");
    
    if (typeof expected.status_code === 'number') {
      lines.push(`        assertEquals(${expected.status_code}, response.statusCode());`);
    }
    if (expected.message) {
      lines.push(`        assertTrue(response.body().contains("${escapeDoubleQuotes(expected.message)}"));`);
    }
    lines.push("    }");
  });

  lines.push("}");
  lines.push("");
  return lines.join('\n');
}

// ==================== PHPUNIT (PHP) ====================
function buildPHPUnitTestFile(testCases, payload) {
  const className = `Test${(payload.api || '/api').replace(/[^a-zA-Z0-9]/g, '')}`;
  const lines = [];
  
  lines.push("<?php");
  lines.push("");
  lines.push("use PHPUnit\\Framework\\TestCase;");
  lines.push("");
  lines.push("/**");
  lines.push(` * Auto-generated PHPUnit test suite for ${payload.method} ${payload.api}`);
  lines.push(" */");
  lines.push(`class ${className}Test extends TestCase`);
  lines.push("{");
  lines.push("    private string $baseUrl = 'http://localhost:3000';");
  lines.push("");

  if (!testCases || testCases.length === 0) {
    lines.push("    public function testSmokeEndpointResponds(): void");
    lines.push("    {");
    lines.push(`        $ch = curl_init($this->baseUrl . '${payload.api || '/health'}');`);
    lines.push("        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);");
    lines.push("        $response = curl_exec($ch);");
    lines.push("        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);");
    lines.push("        curl_close($ch);");
    lines.push("        $this->assertGreaterThanOrEqual(200, $statusCode);");
    lines.push("        $this->assertLessThan(600, $statusCode);");
    lines.push("    }");
  }

  testCases.forEach((tc, idx) => {
    const desc = tc.description || `case ${idx}`;
    const methodName = `test${idx}${desc.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)}`;
    const input = tc.input || tc;
    const method = (input.method || payload.method || 'POST').toUpperCase();
    const api = input.api || payload.api || '/';
    const headers = input.headers || {};
    const body = input.body === undefined ? null : input.body;
    const expected = tc.expected || {};

    lines.push("");
    lines.push(`    /** ${desc} */`);
    lines.push(`    public function ${methodName}(): void`);
    lines.push("    {");
    lines.push(`        $ch = curl_init($this->baseUrl . '${api}');`);
    lines.push("        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);");
    lines.push(`        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');`);
    
    if (body !== null && method !== 'GET') {
      lines.push(`        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(body)}));`);
    }
    
    const headerList = ["'Content-Type: application/json'"];
    for (const [k, v] of Object.entries(headers)) {
      headerList.push(`'${k}: ${v}'`);
    }
    lines.push(`        curl_setopt($ch, CURLOPT_HTTPHEADER, [${headerList.join(', ')}]);`);
    
    lines.push("        $response = curl_exec($ch);");
    lines.push("        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);");
    lines.push("        curl_close($ch);");
    
    if (typeof expected.status_code === 'number') {
      lines.push(`        $this->assertEquals(${expected.status_code}, $statusCode);`);
    }
    if (expected.message) {
      lines.push(`        $this->assertStringContainsString('${escapeSingleQuotes(expected.message)}', $response);`);
    }
    lines.push("    }");
  });

  lines.push("}");
  lines.push("");
  return lines.join('\n');
}

// ==================== GO TESTING ====================
function buildGoTestFile(testCases, payload) {
  const lines = [];
  
  lines.push("package main");
  lines.push("");
  lines.push("import (");
  lines.push('    "bytes"');
  lines.push('    "encoding/json"');
  lines.push('    "net/http"');
  lines.push('    "testing"');
  lines.push(")");
  lines.push("");
  lines.push("const baseURL = \"http://localhost:3000\"");
  lines.push("");

  if (!testCases || testCases.length === 0) {
    lines.push("func TestSmokeEndpointResponds(t *testing.T) {");
    lines.push(`    resp, err := http.Get(baseURL + "${payload.api || '/health'}")`);
    lines.push("    if err != nil {");
    lines.push('        t.Fatalf("Request failed: %v", err)');
    lines.push("    }");
    lines.push("    defer resp.Body.Close()");
    lines.push("    if resp.StatusCode < 200 || resp.StatusCode >= 600 {");
    lines.push('        t.Errorf("Expected status 2xx-5xx, got %d", resp.StatusCode)');
    lines.push("    }");
    lines.push("}");
  }

  testCases.forEach((tc, idx) => {
    const desc = tc.description || `case ${idx}`;
    const funcName = `Test${idx}${desc.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)}`;
    const input = tc.input || tc;
    const method = (input.method || payload.method || 'POST').toUpperCase();
    const api = input.api || payload.api || '/';
    const body = input.body === undefined ? null : input.body;
    const expected = tc.expected || {};

    lines.push("");
    lines.push(`// ${desc}`);
    lines.push(`func ${funcName}(t *testing.T) {`);
    
    if (body !== null && method !== 'GET') {
      lines.push(`    bodyData, _ := json.Marshal(${JSON.stringify(body)})`);
      lines.push(`    req, err := http.NewRequest("${method}", baseURL+"${api}", bytes.NewBuffer(bodyData))`);
    } else {
      lines.push(`    req, err := http.NewRequest("${method}", baseURL+"${api}", nil)`);
    }
    
    lines.push("    if err != nil {");
    lines.push('        t.Fatalf("Failed to create request: %v", err)');
    lines.push("    }");
    lines.push('    req.Header.Set("Content-Type", "application/json")');
    
    lines.push("    client := &http.Client{}");
    lines.push("    resp, err := client.Do(req)");
    lines.push("    if err != nil {");
    lines.push('        t.Fatalf("Request failed: %v", err)');
    lines.push("    }");
    lines.push("    defer resp.Body.Close()");
    
    if (typeof expected.status_code === 'number') {
      lines.push(`    if resp.StatusCode != ${expected.status_code} {`);
      lines.push(`        t.Errorf("Expected status ${expected.status_code}, got %d", resp.StatusCode)`);
      lines.push("    }");
    }
    lines.push("}");
  });

  lines.push("");
  return lines.join('\n');
}

// ==================== MAIN GENERATOR ====================
function generateTestFiles(testCases, payload, framework, language) {
  const files = {};
  const safePayload = payload || { api: '/', method: 'GET' };
  const safeTestCases = testCases || [];
  
  // Normalize framework name
  const fw = (framework || 'jest+supertest').toLowerCase();
  
  if (fw.includes('jest') || fw.includes('supertest') || language === 'javascript' || language === 'typescript') {
    const content = buildJestTestFile(safeTestCases, safePayload);
    files['tests/generated.test.js'] = content;
    files['generated.test.js'] = content;
  }
  
  if (fw.includes('pytest') || language === 'python' || language === 'py') {
    const content = buildPytestTestFile(safeTestCases, safePayload);
    files['tests/test_generated.py'] = content;
    files['test_generated.py'] = content;
  }
  
  if (fw.includes('junit') || language === 'java') {
    const content = buildJUnitTestFile(safeTestCases, safePayload);
    const className = `Test${(safePayload.api || '/api').replace(/[^a-zA-Z0-9]/g, '')}`;
    files[`tests/${className}.java`] = content;
    files[`${className}.java`] = content;
  }
  
  if (fw.includes('phpunit') || language === 'php') {
    const content = buildPHPUnitTestFile(safeTestCases, safePayload);
    const className = `Test${(safePayload.api || '/api').replace(/[^a-zA-Z0-9]/g, '')}`;
    files[`tests/${className}Test.php`] = content;
    files[`${className}Test.php`] = content;
  }
  
  if (fw.includes('testing') || fw.includes('go') || language === 'go' || language === 'golang') {
    const content = buildGoTestFile(safeTestCases, safePayload);
    files['tests/generated_test.go'] = content;
    files['generated_test.go'] = content;
  }
  
  // If no framework matched, default to Jest
  if (Object.keys(files).length === 0) {
    const content = buildJestTestFile(safeTestCases, safePayload);
    files['tests/generated.test.js'] = content;
    files['generated.test.js'] = content;
  }
  
  return files;
}

// Legacy export for backwards compatibility
function generateJestTestFiles(testCases, payload) {
  return generateTestFiles(testCases, payload, 'jest+supertest', 'javascript');
}

module.exports = {
  generateTestFiles,
  generateJestTestFiles,
  buildJestTestFile,
  buildPytestTestFile,
  buildJUnitTestFile,
  buildPHPUnitTestFile,
  buildGoTestFile
};
