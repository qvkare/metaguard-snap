import { type Panel, type NodeType } from '@metamask/snaps-sdk';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Transaction {
  to?: string;
  value?: string;
  data?: string;
}

export interface SecurityCheck {
  name: string;
  passed: boolean;
  details?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ContractInfo {
  verified: boolean;
  name?: string;
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
  risk: RiskLevel;
  warnings: string[];
  recommendations: string[];
  securityChecks: SecurityCheck[];
  contractInfo: ContractInfo;
  phishingResults: PhishingResult;
  riskAssessment: RiskAssessment;
  timestamp: number;
}

export interface PanelChild {
  type: NodeType;
  value?: string;
  children?: PanelChild[];
}

export interface CustomPanel extends Panel {
  type: 'panel';
  children: PanelChild[];
}

export interface SnapResponse {
  content: CustomPanel;
}

export { type Transaction as MetaMaskTransaction } from '@metamask/snaps-sdk'; 