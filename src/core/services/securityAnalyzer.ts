import { Transaction, SecurityReport, RiskLevel } from '../../types';
import { PhishingDetector } from './phishingDetector';
import { EtherscanService } from './etherscan';

export class SecurityAnalyzer {
  private phishingDetector: PhishingDetector;
  private etherscanService: EtherscanService;

  constructor(phishingDetector?: PhishingDetector, etherscanService?: EtherscanService) {
    this.phishingDetector = phishingDetector || new PhishingDetector();
    this.etherscanService = etherscanService || new EtherscanService();
  }

  async analyzeTransaction(transaction: Transaction): Promise<SecurityReport> {
    try {
      const phishingCheck = await this.phishingDetector.checkAddress(transaction.to);
      const contractInfo = await this.etherscanService.getContractInfo(transaction.to);
      
      let risk: RiskLevel = 'low';
      const warnings: string[] = [];
      const recommendations: string[] = [];
      
      if (phishingCheck.isPhishing) {
        risk = 'high';
        warnings.push('Phishing risk detected');
        recommendations.push('This address has been flagged as potentially malicious. Please verify the recipient carefully.');
      }

      if (!contractInfo.verified && transaction.data) {
        warnings.push('Interacting with unverified contract');
        recommendations.push('Exercise caution when interacting with unverified smart contracts.');
        risk = risk === 'high' ? 'high' : 'medium';
      }

      return {
        risk,
        warnings,
        recommendations,
        securityChecks: [],
        contractInfo,
        phishingResults: phishingCheck,
        isSecure: risk === 'low' && warnings.length === 0,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        risk: 'medium',
        warnings: ['Unable to complete security checks'],
        recommendations: ['Please verify the transaction details manually'],
        securityChecks: [],
        isSecure: false,
        timestamp: Date.now()
      };
    }
  }
} 