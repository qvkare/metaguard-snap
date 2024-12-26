export type RiskLevel = 'high' | 'medium' | 'low';

export interface Transaction {
  to: string;
  from: string;
  value: string;
  data?: string;
  nonce?: string;
  gas?: string;
  gasPrice?: string;
  estimateUsed?: string;
  estimateSuggested?: string;
}

export interface SecurityReport {
  risk: RiskLevel;
  warnings: string[];
  recommendations: string[];
  securityChecks: any[];
  contractInfo?: {
    verified: boolean;
    name?: string;
    compiler?: string;
    version?: string;
    balance?: string;
    txCount?: number;
  };
  phishingResults?: {
    isPhishing: boolean;
    confidence: number;
    reason?: string;
  };
  isSecure: boolean;
  timestamp?: number;
}
