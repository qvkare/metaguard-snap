import { type Transaction, type EIP1559Transaction, type LegacyTransaction } from '@metamask/snaps-sdk';
import { PhishingDetector } from '../../services/phishingDetector';
import { MLModel, TransactionFeatures } from '../../ml/models/mlModel';
import { EtherscanService, ContractInfo } from '../../services/etherscan';

export interface SecurityCheck {
  name: string;
  passed: boolean;
  details?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RiskAssessment {
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  details: string[];
}

export interface SecurityReport {
  risk: 'high' | 'medium' | 'low';
  warnings: string[];
  recommendations: string[];
  contractInfo?: ContractInfo;
  phishingResults?: {
    isPhishing: boolean;
    confidence: number;
    reason?: string;
  };
  riskAssessment?: RiskAssessment;
  securityChecks?: SecurityCheck[];
  timestamp?: number;
}

export class SecurityAnalyzer {
  private phishingDetector: PhishingDetector;
  private mlModel: MLModel;
  private etherscanService: EtherscanService;

  constructor() {
    this.phishingDetector = new PhishingDetector();
    this.mlModel = new MLModel();
    this.etherscanService = new EtherscanService();
  }

  async analyzeTransaction(transaction: Transaction): Promise<SecurityReport> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const securityChecks: SecurityCheck[] = [];

    // Contract creation check
    if (transaction.to === null) {
      warnings.push("This transaction creates a new contract");
      recommendations.push("Review the contract code carefully before deployment");
      securityChecks.push({
        name: 'Contract Creation',
        passed: false,
        details: 'Transaction creates a new contract',
        severity: 'HIGH'
      });
    }

    // Value check
    const value = BigInt(transaction.value || '0');
    if (value > BigInt('1000000000000000000')) { // > 1 ETH
      warnings.push("High value transaction");
      recommendations.push("Double check the recipient address");
      securityChecks.push({
        name: 'Value Check',
        passed: false,
        details: 'Transaction value exceeds 1 ETH',
        severity: 'HIGH'
      });
    }

    // Gas price check based on transaction type
    const isEIP1559 = 'maxFeePerGas' in transaction;
    if (isEIP1559) {
      const eip1559Tx = transaction as EIP1559Transaction;
      const maxFeePerGas = BigInt(eip1559Tx.maxFeePerGas || '0');
      if (maxFeePerGas > BigInt('100000000000')) { // > 100 Gwei
        warnings.push("High gas fee");
        recommendations.push("Consider waiting for lower gas prices");
        securityChecks.push({
          name: 'Gas Price Check',
          passed: false,
          details: 'Max fee per gas exceeds 100 Gwei',
          severity: 'MEDIUM'
        });
      }
    } else {
      const legacyTx = transaction as LegacyTransaction;
      const gasPrice = BigInt(legacyTx.gasPrice || '0');
      if (gasPrice > BigInt('100000000000')) { // > 100 Gwei
        warnings.push("High gas fee");
        recommendations.push("Consider waiting for lower gas prices");
        securityChecks.push({
          name: 'Gas Price Check',
          passed: false,
          details: 'Gas price exceeds 100 Gwei',
          severity: 'MEDIUM'
        });
      }
    }

    // Contract interaction check
    let contractInfo: ContractInfo | undefined;
    let phishingResults;
    let mlPrediction = 0;

    if (transaction.to) {
      contractInfo = await this.checkContractSecurity(transaction.to);
      phishingResults = await this.phishingDetector.checkAddress(transaction.to);
      
      // Convert transaction to features for ML model
      const transactionFeatures: TransactionFeatures = {
        value: transaction.value || '0',
        maxFeePerGas: isEIP1559 ? (transaction as EIP1559Transaction).maxFeePerGas : undefined,
        maxPriorityFeePerGas: isEIP1559 ? (transaction as EIP1559Transaction).maxPriorityFeePerGas : undefined,
        to: transaction.to,
        data: transaction.data
      };
      
      mlPrediction = await this.mlModel.predict(transactionFeatures);

      if (!contractInfo.verified) {
        warnings.push("Unverified contract");
        recommendations.push("Exercise caution when interacting with unverified contracts");
        securityChecks.push({
          name: 'Contract Verification',
          passed: false,
          details: 'Contract is not verified on Etherscan',
          severity: 'HIGH'
        });
      }

      if (phishingResults.isPhishing) {
        warnings.push(`Potential phishing risk: ${phishingResults.reason}`);
        recommendations.push("Avoid interacting with this address");
        securityChecks.push({
          name: 'Phishing Detection',
          passed: false,
          details: phishingResults.reason || 'Address identified as potential phishing risk',
          severity: 'HIGH'
        });
      }
    }

    const riskLevel = this.calculateRiskLevel(warnings.length, phishingResults?.isPhishing || false, mlPrediction);
    const riskAssessment: RiskAssessment = {
      riskLevel,
      riskScore: mlPrediction,
      details: warnings
    };

    return {
      risk: riskLevel,
      warnings,
      recommendations,
      contractInfo,
      phishingResults,
      riskAssessment,
      securityChecks,
      timestamp: Date.now()
    };
  }

  private calculateRiskLevel(
    warningCount: number,
    isPhishing: boolean,
    mlRiskScore: number
  ): 'high' | 'medium' | 'low' {
    if (isPhishing || mlRiskScore > 0.8 || warningCount >= 3) {
      return 'high';
    } else if (mlRiskScore > 0.5 || warningCount >= 2) {
      return 'medium';
    }
    return 'low';
  }

  private async checkContractSecurity(address: string): Promise<ContractInfo> {
    try {
      const contractInfo = await this.etherscanService.getContractInfo(address);
      
      // Additional security checks
      if (contractInfo.verified) {
        const transactions = await this.etherscanService.getContractTransactions(address);
        if (transactions.length === 0) {
          contractInfo.verified = false; // Mark as unverified if no transaction history
        }
      }

      return contractInfo;
    } catch (error) {
      console.error('Error checking contract security:', error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async performSecurityChecks(transaction: Transaction): Promise<SecurityCheck[]> {
    const securityChecks: SecurityCheck[] = [];

    // Contract creation check
    if (transaction.to === null) {
      securityChecks.push({
        name: 'Contract Creation',
        passed: false,
        details: 'Transaction creates a new contract',
        severity: 'HIGH'
      });
    }

    // Value check
    const value = BigInt(transaction.value || '0');
    if (value > BigInt('1000000000000000000')) {
      securityChecks.push({
        name: 'Value Check',
        passed: false,
        details: 'Transaction value exceeds 1 ETH',
        severity: 'HIGH'
      });
    }

    // Contract verification check
    if (transaction.to) {
      const contractInfo = await this.checkContractSecurity(transaction.to);
      securityChecks.push({
        name: 'Contract Verification',
        passed: contractInfo.verified,
        details: contractInfo.verified ? 'Contract is verified' : 'Contract is not verified',
        severity: contractInfo.verified ? 'LOW' : 'HIGH'
      });

      // Phishing check
      const phishingResults = await this.phishingDetector.checkAddress(transaction.to);
      securityChecks.push({
        name: 'Phishing Detection',
        passed: !phishingResults.isPhishing,
        details: phishingResults.reason || 'No phishing indicators detected',
        severity: phishingResults.isPhishing ? 'HIGH' : 'LOW'
      });
    }

    return securityChecks;
  }

  generateRecommendations(assessment: RiskAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment.riskLevel === 'high') {
      recommendations.push('Review transaction carefully before proceeding');
      recommendations.push('Consider using a hardware wallet for added security');
    }

    if (assessment.riskScore > 0.5) {
      recommendations.push('Verify contract source code on Etherscan');
      recommendations.push('Check contract audit reports if available');
    }

    if (assessment.details.some(detail => detail.includes('Potential phishing'))) {
      recommendations.push('Do not proceed with the transaction');
      recommendations.push('Report the address to the community');
    }

    return recommendations;
  }
} 