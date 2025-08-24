import { AgentVineConfig, OfferRequest, OfferResponse, TestConnectionResult } from './types';
export declare class AgentVineClient {
    private config;
    private baseUrl;
    constructor(config: AgentVineConfig);
    getOffers(request: OfferRequest): Promise<OfferResponse>;
    testConnection(): Promise<TestConnectionResult>;
    private makeRequest;
    private handleError;
}
//# sourceMappingURL=client.d.ts.map