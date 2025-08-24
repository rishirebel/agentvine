import { AgentVineConfig, OfferRequest, OfferResponse, SDKError, TestConnectionResult } from './types';
export declare class AgentVineClient {
    private config;
    private baseUrl;
    private isConnected;
    private connectionError;
    private agent;
    private healthCheckInterval;
    private lastHealthCheck;
    constructor(config: AgentVineConfig);
    private verifyConnection;
    getConnectionStatus(): {
        isConnected: boolean;
        agent: any | null;
        error: SDKError | null;
    };
    isReady(): boolean;
    private startHealthCheck;
    private performHealthCheck;
    destroy(): void;
    getOffers(request: OfferRequest): Promise<OfferResponse>;
    testConnection(): Promise<TestConnectionResult>;
    private makeRequest;
    private handleError;
}
//# sourceMappingURL=client.d.ts.map