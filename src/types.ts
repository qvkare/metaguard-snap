export interface SecurityReport {
  risk: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendations: string[];
  securityChecks: SecurityCheck[];
  contractInfo?: ContractInfo;
  phishingResults?: PhishingResult;
  riskAssessment: RiskAssessment;
  timestamp: number;
}

export interface SecurityCheck {
  name: string;
  passed: boolean;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  details: string[];
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