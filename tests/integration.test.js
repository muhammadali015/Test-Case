/**
 * ============================================================
 * INTEGRATION TEST SUITE - AI Test Case Generator Agent
 * ============================================================
 * 
 * This script tests the agent's compliance with the Supervisor
 * handshake protocol and verifies all endpoints work correctly.
 * 
 * Usage:
 *   1. Start the server: npm start
 *   2. Run tests: node tests/integration.test.js
 * 
 * Requirements Tested:
 *   ✅ Working AI Agent - Responds per JSON contract
 *   ✅ HTTP API Deployment
 *   ✅ Supervisor Communication Protocol
 *   ✅ Logging & Health Check
 *   ✅ External Integration
 */

const http = require('http');

const BASE_URL = process.env.AGENT_URL || 'http://localhost:3000';
const AGENT_NAME = 'testcase_generator_agent';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
    const status = passed ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`;
    console.log(`${status}${colors.reset} ${name}`);
    if (details) {
        console.log(`   ${colors.cyan}→ ${details}${colors.reset}`);
    }
}

// HTTP Request Helper
function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(options.path, BASE_URL);
        const reqOptions = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Generate UUID
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================================
// TEST CASES
// ============================================================

const tests = {
    /**
     * TEST 1: Health Check Endpoint
     * Requirement: Logging & Health Check
     */
    async healthCheck() {
        log('\n📋 TEST 1: Health Check Endpoint', 'blue');
        
        const response = await makeRequest({ path: '/health', method: 'GET' });
        
        const passed = response.status === 200 && 
                      response.body.status === "I'm up" &&
                      response.body.agent_name;
        
        logTest('Health endpoint returns status', passed, 
            `Status: ${response.body.status}, Agent: ${response.body.agent_name}`);
        
        return passed;
    },

    /**
     * TEST 2: Root Endpoint Status
     * Requirement: HTTP API Deployment
     */
    async rootEndpoint() {
        log('\n📋 TEST 2: Root Endpoint Status', 'blue');
        
        const response = await makeRequest({ path: '/', method: 'GET' });
        
        const passed = response.status === 200 && 
                      response.body.status === 'ok';
        
        logTest('Root endpoint returns OK', passed,
            `Message: ${response.body.message}`);
        
        return passed;
    },

    /**
     * TEST 3: Supervisor Handshake - Task Assignment
     * Requirement: Communication with Supervisor structure
     */
    async supervisorHandshake() {
        log('\n📋 TEST 3: Supervisor Handshake Protocol', 'blue');
        
        const messageId = uuid();
        const supervisorMessage = {
            message_id: messageId,
            sender: "supervisor",
            recipient: AGENT_NAME,
            type: "task_assignment",
            timestamp: new Date().toISOString(),
            "results/task": {
                task_type: "generate_test_cases",
                language: "javascript",
                payload: {
                    api: "/api/users",
                    method: "POST",
                    fields: ["email", "password", "name"],
                    requires_auth: true
                }
            }
        };

        const response = await makeRequest(
            { path: '/execute', method: 'POST' },
            supervisorMessage
        );

        // Validate response structure
        const body = response.body;
        const checks = {
            hasMessageId: !!body.message_id,
            hasSender: body.sender === AGENT_NAME,
            hasRecipient: body.recipient === 'supervisor',
            hasType: body.type === 'task_response',
            hasRelatedId: body.related_message_id === messageId,
            hasStatus: !!body.status,
            hasResults: !!body['results/task'],
            hasTimestamp: !!body.timestamp
        };

        const allPassed = Object.values(checks).every(v => v);
        
        logTest('Response follows handshake protocol', allPassed);
        logTest('  → message_id present', checks.hasMessageId);
        logTest('  → sender is agent', checks.hasSender);
        logTest('  → recipient is supervisor', checks.hasRecipient);
        logTest('  → type is task_response', checks.hasType);
        logTest('  → related_message_id matches', checks.hasRelatedId);
        logTest('  → status present', checks.hasStatus);
        logTest('  → results/task present', checks.hasResults);
        logTest('  → timestamp present', checks.hasTimestamp);

        return allPassed;
    },

    /**
     * TEST 4: Test Case Generation
     * Requirement: Working AI Agent - Functional response
     */
    async testCaseGeneration() {
        log('\n📋 TEST 4: Test Case Generation', 'blue');
        
        const supervisorMessage = {
            message_id: uuid(),
            sender: "supervisor",
            recipient: AGENT_NAME,
            type: "task_assignment",
            timestamp: new Date().toISOString(),
            "results/task": {
                task_type: "generate_test_cases",
                language: "javascript",
                payload: {
                    api: "/login",
                    method: "POST",
                    fields: ["email", "password"],
                    requires_auth: false
                }
            }
        };

        const response = await makeRequest(
            { path: '/execute', method: 'POST' },
            supervisorMessage
        );

        const results = response.body['results/task'];
        const testCases = results?.generated_test_cases || [];
        
        const checks = {
            hasTestCases: testCases.length > 0,
            hasStatusMessage: !!results?.status_message,
            testCasesHaveDescription: testCases.every(tc => tc.description),
            testCasesHaveInput: testCases.every(tc => tc.input),
            testCasesHaveExpected: testCases.every(tc => tc.expected)
        };

        const allPassed = Object.values(checks).every(v => v);

        logTest('Test cases generated', checks.hasTestCases, 
            `Count: ${testCases.length}`);
        logTest('Status message present', checks.hasStatusMessage,
            results?.status_message);
        logTest('All test cases have description', checks.testCasesHaveDescription);
        logTest('All test cases have input', checks.testCasesHaveInput);
        logTest('All test cases have expected', checks.testCasesHaveExpected);

        // Show sample test case
        if (testCases.length > 0) {
            log('\n   Sample Test Case:', 'cyan');
            console.log('   ', JSON.stringify(testCases[0], null, 2).split('\n').join('\n   '));
        }

        return allPassed;
    },

    /**
     * TEST 5: Error Handling - Invalid Task Type
     * Requirement: Working AI Agent - Proper error responses
     */
    async errorHandling() {
        log('\n📋 TEST 5: Error Handling', 'blue');
        
        const supervisorMessage = {
            message_id: uuid(),
            sender: "supervisor",
            recipient: AGENT_NAME,
            type: "task_assignment",
            timestamp: new Date().toISOString(),
            "results/task": {
                task_type: "invalid_task_type",
                language: "javascript"
            }
        };

        const response = await makeRequest(
            { path: '/execute', method: 'POST' },
            supervisorMessage
        );

        const passed = response.status === 400 && 
                      (response.body.status === 'failed' || response.body['results/task']?.error_details);
        
        logTest('Returns error for invalid task type', passed,
            response.body['results/task']?.status_message || response.body.message);
        
        return passed;
    },

    /**
     * TEST 6: Input Validation
     * Requirement: Security & Validation
     */
    async inputValidation() {
        log('\n📋 TEST 6: Input Validation', 'blue');
        
        // Test with invalid message type
        const invalidMessage = {
            message_id: uuid(),
            sender: "supervisor",
            recipient: AGENT_NAME,
            type: "invalid_type", // Should be task_assignment
            timestamp: new Date().toISOString(),
            "results/task": {}
        };

        const response = await makeRequest(
            { path: '/execute', method: 'POST' },
            invalidMessage
        );

        const passed = response.status === 400;
        
        logTest('Rejects invalid message type', passed,
            `Status: ${response.status}`);
        
        return passed;
    },

    /**
     * TEST 7: Coverage Analysis
     * Requirement: Working AI Agent - Complete response
     */
    async coverageAnalysis() {
        log('\n📋 TEST 7: Coverage Analysis & Recommendations', 'blue');
        
        const supervisorMessage = {
            message_id: uuid(),
            sender: "supervisor",
            recipient: AGENT_NAME,
            type: "task_assignment",
            timestamp: new Date().toISOString(),
            "results/task": {
                task_type: "generate_test_cases",
                language: "python",
                payload: {
                    api: "/api/register",
                    method: "POST",
                    fields: ["username", "email", "password"],
                    requires_auth: false
                }
            }
        };

        const response = await makeRequest(
            { path: '/execute', method: 'POST' },
            supervisorMessage
        );

        const results = response.body['results/task'];
        
        const checks = {
            hasCoverage: !!results?.coverage_analysis,
            hasRecommendations: !!results?.recommendations,
            hasTestCasesMetadata: !!results?.test_cases
        };

        const allPassed = Object.values(checks).every(v => v);

        logTest('Coverage analysis present', checks.hasCoverage);
        logTest('Recommendations present', checks.hasRecommendations);
        logTest('Test cases metadata present', checks.hasTestCasesMetadata);

        return allPassed;
    }
};

// ============================================================
// TEST RUNNER
// ============================================================

async function runTests() {
    log('\n' + '='.repeat(60), 'yellow');
    log('  AI TEST CASE GENERATOR - INTEGRATION TESTS', 'yellow');
    log('='.repeat(60), 'yellow');
    log(`\nTarget: ${BASE_URL}`, 'cyan');
    log(`Time: ${new Date().toISOString()}`, 'cyan');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    for (const [name, testFn] of Object.entries(tests)) {
        try {
            const passed = await testFn();
            results.tests.push({ name, passed, error: null });
            if (passed) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            log(`\n❌ ${name} - ERROR: ${error.message}`, 'red');
            results.tests.push({ name, passed: false, error: error.message });
            results.failed++;
        }
    }

    // Summary
    log('\n' + '='.repeat(60), 'yellow');
    log('  TEST SUMMARY', 'yellow');
    log('='.repeat(60), 'yellow');
    
    const total = results.passed + results.failed;
    const passRate = ((results.passed / total) * 100).toFixed(1);
    
    log(`\nTotal Tests: ${total}`, 'cyan');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Pass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');

    if (results.failed === 0) {
        log('\n🎉 All tests passed! Agent is fully compliant.', 'green');
    } else {
        log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
    }

    log('\n' + '='.repeat(60) + '\n', 'yellow');

    // Return exit code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
    log(`\n💥 Test runner failed: ${err.message}`, 'red');
    process.exit(1);
});

