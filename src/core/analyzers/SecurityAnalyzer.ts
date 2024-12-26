import { PhishingDetector } from '../../services/phishingDetector';
import { EtherscanService } from '../../services/etherscan';
import { SecurityReport, RiskLevel, SecurityCheck, Transaction } from '../../types/common';

export class SecurityAnalyzer {
  private readonly phishingDetector: PhishingDetector;
  private readonly etherscanService: EtherscanService;

  constructor(
    phishingDetector?: PhishingDetector,
    etherscanService?: EtherscanService
  ) {
    this.phishingDetector = phishingDetector || new PhishingDetector();
    this.etherscanService = etherscanService || new EtherscanService();
  }

  async analyzeTransaction(transaction: Transaction): Promise<SecurityReport> {
    if (!transaction.to) {
      throw new Error('Transaction destination address is required');
    }

    const securityChecks = await this.performSecurityChecks(transaction);
    const riskAssessment = this.assessRisk(securityChecks);
    const recommendations = this.generateRecommendations(riskAssessment);

    return {
      risk: riskAssessment.riskLevel,
      warnings: riskAssessment.details,
      recommendations,
      securityChecks,
      contractInfo: await this.etherscanService.getContractInfo(transaction.to),
      phishingResults: await this.phishingDetector.checkAddress(transaction.to),
      riskAssessment,
      timestamp: Date.now()
    };
  }

  async performSecurityChecks(transaction: Transaction): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];
    
    // Value check
    if (transaction.value && BigInt(transaction.value) > BigInt('1000000000000000000')) {
      checks.push({
        name: 'Value Check',
        passed: false,
        details: 'High value transaction',
        severity: 'MEDIUM'
      });
    }

    // Contract verification check
    if (transaction.to) {
      const contractInfo = await this.etherscanService.getContractInfo(transaction.to);
      checks.push({
        name: 'Contract Verification',
        passed: contractInfo.verified,
        details: contractInfo.verified ? 'Contract is verified' : 'Contract is not verified',
        severity: contractInfo.verified ? 'LOW' : 'HIGH'
      });
    }

    // Phishing check
    if (transaction.to) {
      const phishingResult = await this.phishingDetector.checkAddress(transaction.to);
      checks.push({
        name: 'Phishing Detection',
        passed: !phishingResult.isPhishing,
        details: phishingResult.reason || 'No phishing detected',
        severity: phishingResult.isPhishing ? 'HIGH' : 'LOW'
      });
    }

    return checks;
  }

  private assessRisk(checks: SecurityCheck[]): { riskLevel: RiskLevel; riskScore: number; details: string[] } {
    const highSeverityFailures = checks.filter(check => !check.passed && check.severity === 'HIGH');
    const mediumSeverityFailures = checks.filter(check => !check.passed && check.severity === 'MEDIUM');
    
    const details = checks
      .filter(check => !check.passed)
      .map(check => check.details);

    if (highSeverityFailures.length > 0) {
      return { riskLevel: 'high', riskScore: 0.8, details };
    }
    
    if (mediumSeverityFailures.length > 0) {
      return { riskLevel: 'medium', riskScore: 0.5, details };
    }

    return { riskLevel: 'low', riskScore: 0.2, details };
  }

  generateRecommendations(assessment: { riskLevel: RiskLevel; details: string[] }): string[] {
    const recommendations: string[] = [];

    if (assessment.riskLevel === 'high') {
      recommendations.push('Review transaction carefully before proceeding');
      recommendations.push('Consider using a different contract or service');
    }

    if (assessment.riskLevel === 'medium') {
      recommendations.push('Review transaction details');
      recommendations.push('Verify contract source code if available');
    }

    if (assessment.details.length > 0) {
      recommendations.push('Address specific issues before proceeding');
    }

    return recommendations;
  }
} 