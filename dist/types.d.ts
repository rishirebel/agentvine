export interface AgentVineConfig {
    agentId: string;
    agentSecretKey: string;
    baseUrl?: string;
    environment?: 'production' | 'development' | 'local';
    timeout?: number;
    autoVerify?: boolean;
    onConnectionVerified?: (agent: any) => void;
    onConnectionFailed?: (error: SDKError) => void;
}
export interface OfferRequest {
    query: string;
    sessionId: string;
    context?: string;
}
export interface Offer {
    id: number;
    title: string;
    description: string;
    callToAction: string;
    actionEndpoint: string;
    productName: string;
    productWebsite: string;
}
export interface OfferResponse {
    success: boolean;
    query: string;
    sessionId: string;
    offers: Offer[];
}
export interface SDKError {
    code: string;
    message: string;
    details?: any;
}
export interface TestConnectionResult {
    success: boolean;
    message: string;
    agent?: {
        id: number;
        name: string;
        type: string;
        status: string;
    };
}
//# sourceMappingURL=types.d.ts.map