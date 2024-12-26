export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Transaction {
  to?: string;
  value?: string;
  data?: string;
}

export interface SecurityCheck {
  name: string;
  passed: boolean;
  severity: Severity;
  details?: string;
}

export interface ContractInfo {
  verified: boolean;
  name?: string;
  compiler?: string;
  version?: string;
  balance?: string;
  txCount?: number;
}

export interface PhishingResult {
  isPhishing: boolean;
  confidence: number;
  reason?: string;
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  riskScore: number;
  details: string[];
}

export interface SecurityReport {
  riskLevel: RiskLevel;
  riskScore: number;
  warnings: string[];
  recommendations: string[];
  securityChecks: SecurityCheck[];
  contractInfo?: ContractInfo;
  phishingResults?: PhishingResult;
  timestamp?: number;
}
