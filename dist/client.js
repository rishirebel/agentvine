"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVineClient = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class AgentVineClient {
    constructor(config) {
        this.isConnected = false;
        this.connectionError = null;
        this.agent = null;
        this.healthCheckInterval = null;
        this.lastHealthCheck = null;
        this.config = config;
        if (config.baseUrl) {
            this.baseUrl = config.baseUrl;
        }
        else {
            switch (config.environment) {
                case 'local':
                    this.baseUrl = 'http://localhost:3001';
                    break;
                case 'development':
                    this.baseUrl = 'https://dev-api.agentvine.dev';
                    break;
                case 'production':
                default:
                    this.baseUrl = 'https://api.agentvine.dev';
                    break;
            }
        }
        if (!config.agentId || !config.agentSecretKey) {
            throw new Error('AgentVine SDK: agentId and agentSecretKey are required');
        }
        if (config.autoVerify !== false) {
            this.verifyConnection();
        }
        this.startHealthCheck();
    }
    async verifyConnection() {
        try {
            const result = await this.testConnection();
            if (result.success && result.agent) {
                this.isConnected = true;
                this.agent = result.agent;
                this.connectionError = null;
                console.log(`✅ AgentVine: Connected successfully as "${result.agent.name}" (ID: ${result.agent.id})`);
                if (this.config.onConnectionVerified) {
                    this.config.onConnectionVerified(result.agent);
                }
            }
            else {
                throw new Error(result.message || 'Connection verification failed');
            }
        }
        catch (error) {
            this.isConnected = false;
            this.connectionError = {
                code: 'CONNECTION_FAILED',
                message: error.message || 'Failed to verify agent credentials',
                details: error
            };
            console.error('❌ AgentVine: Connection verification failed:', this.connectionError.message);
            if (this.config.onConnectionFailed) {
                this.config.onConnectionFailed(this.connectionError);
            }
        }
    }
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            agent: this.agent,
            error: this.connectionError
        };
    }
    isReady() {
        return this.isConnected;
    }
    startHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000);
        setTimeout(() => this.performHealthCheck(), 1000);
    }
    async performHealthCheck() {
        try {
            const response = await this.makeRequest('/api/sdk/test', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'health-check',
                    sessionId: `health-${Date.now()}`,
                    context: 'background-health-check'
                })
            });
            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                this.connectionError = null;
                this.lastHealthCheck = new Date();
                if (data.agent) {
                    this.agent = data.agent;
                }
            }
            else {
                this.isConnected = false;
                this.connectionError = {
                    code: 'HEALTH_CHECK_FAILED',
                    message: 'Background health check failed',
                    details: { status: response.status, statusText: response.statusText }
                };
            }
        }
        catch (error) {
            this.isConnected = false;
            this.connectionError = {
                code: 'HEALTH_CHECK_ERROR',
                message: error.message || 'Health check error',
                details: error
            };
        }
    }
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    async getOffers(request) {
        try {
            const response = await this.makeRequest('/api/sdk/offers', {
                method: 'POST',
                body: JSON.stringify({
                    query: request.query,
                    sessionId: request.sessionId,
                    context: request.context
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            throw this.handleError(error, 'Failed to get offers');
        }
    }
    async testConnection() {
        try {
            const response = await this.makeRequest('/api/sdk/test', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'test query',
                    context: 'test context',
                    sessionId: 'test-session-' + Date.now()
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            throw this.handleError(error, 'Connection test failed');
        }
    }
    async makeRequest(endpoint, options) {
        const url = `${this.baseUrl}${endpoint}`;
        const timeout = this.config.timeout || 10000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await (0, cross_fetch_1.default)(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Agent-Id': this.config.agentId,
                    'X-Agent-Secret-Key': this.config.agentSecretKey,
                    ...options.headers
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }
    handleError(error, context) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const sdkError = {
            code: 'AGENTVINE_ERROR',
            message: `${context}: ${errorMessage || 'Unknown error'}`,
            details: error
        };
        if (errorMessage.includes('timeout')) {
            sdkError.code = 'TIMEOUT_ERROR';
        }
        else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            sdkError.code = 'AUTH_ERROR';
        }
        else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            sdkError.code = 'NETWORK_ERROR';
        }
        return sdkError;
    }
}
exports.AgentVineClient = AgentVineClient;
//# sourceMappingURL=client.js.map