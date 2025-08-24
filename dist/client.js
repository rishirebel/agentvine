"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVineClient = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class AgentVineClient {
    constructor(config) {
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