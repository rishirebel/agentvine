/**
 * AgentVine SDK Client
 * @author Rishikesh Chandra
 */

import fetch from 'cross-fetch';
import { 
  AgentVineConfig, 
  OfferRequest, 
  OfferResponse, 
  SDKError, 
  TestConnectionResult 
} from './types';

export class AgentVineClient {
  private config: AgentVineConfig;
  private baseUrl: string;

  constructor(config: AgentVineConfig) {
    this.config = config;
    
    // Determine base URL based on environment or explicit baseUrl
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
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

  /**
   * Get sponsored offers for a user query
   * @param request - The offer request containing query, sessionId, and optional context
   * @returns Promise<OfferResponse> - Array of relevant sponsored offers
   */
  async getOffers(request: OfferRequest): Promise<OfferResponse> {
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

      const data: OfferResponse = await response.json();
      return data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get offers');
    }
  }

  /**
   * Test the connection and validate agent credentials
   * @returns Promise<TestConnectionResult> - Connection test result
   */
  async testConnection(): Promise<TestConnectionResult> {
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

      const data: TestConnectionResult = await response.json();
      return data;
    } catch (error) {
      throw this.handleError(error, 'Connection test failed');
    }
  }

  /**
   * Make an authenticated request to the AgentVine API
   * @private
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = this.config.timeout || 10000; // 10 seconds default

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
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
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Handle and format errors consistently
   * @private
   */
  private handleError(error: unknown, context: string): SDKError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const sdkError: SDKError = {
      code: 'AGENTVINE_ERROR',
      message: `${context}: ${errorMessage || 'Unknown error'}`,
      details: error
    };

    if (errorMessage.includes('timeout')) {
      sdkError.code = 'TIMEOUT_ERROR';
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      sdkError.code = 'AUTH_ERROR';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      sdkError.code = 'NETWORK_ERROR';
    }

    return sdkError;
  }
}