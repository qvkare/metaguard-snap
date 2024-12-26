import { PhishingDetector } from '../services/phishingDetector';
import { EtherscanService } from '../services/etherscan';
import { SecurityCheck, SecurityReport, RiskLevel } from '../../types';

interface Transaction {
  to?: string;
  value?: string;
  data?: string;
}

export class SecurityAnalyzer {
  private phishingDetector: PhishingDetector;
  private etherscanService: EtherscanService;

  constructor(phishingDetector?: PhishingDetector, etherscanService?: EtherscanService) {
    this.phishingDetector = phishingDetector || new PhishingDetector();
    this.etherscanService = etherscanService || new EtherscanService();
  }

  async analyzeTransaction(transaction: Transaction): Promise<SecurityReport> {
    const securityChecks: SecurityCheck[] = [
      {
        name: 'Contract Verification',
        passed: transaction.to
          ? await this.etherscanService.isContractVerified(transaction.to)
          : false,
        severity: 'HIGH',
        details: 'Contract source code verification status',
      },
      {
        name: 'Phishing Detection',
        passed: transaction.to
          ? !(await this.phishingDetector.isPhishingSite(transaction.to))
          : true,
        severity: 'HIGH',
        details: 'Check if the contract is associated with known phishing attempts',
      },
    ];

    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!transaction.to) {
      warnings.push('Contract creation transaction detected');
      recommendations.push('Review the contract code carefully before deployment');
    }

    if (transaction.value && parseInt(transaction.value, 16) > 0) {
      warnings.push('Transaction involves value transfer');
      recommendations.push('Verify the recipient address and amount before confirming');
    }

    const { riskLevel, riskScore } = this.calculateRisk(securityChecks);

    return {
      riskLevel,
      riskScore,
      warnings,
      recommendations,
      securityChecks,
    };
  }

  private calculateRisk(checks: SecurityCheck[]): { riskLevel: RiskLevel; riskScore: number } {
    const highRiskFailures = checks.filter((check) => !check.passed && check.severity === 'HIGH');
    const mediumRiskFailures = checks.filter((check) => !check.passed && check.severity === 'MEDIUM');

    const riskScore = (highRiskFailures.length * 3 + mediumRiskFailures.length) / checks.length;

    let riskLevel: RiskLevel;
    if (highRiskFailures.length > 0) {
      riskLevel = 'HIGH';
    } else if (mediumRiskFailures.length > 0) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return { riskLevel, riskScore };
  }
}
