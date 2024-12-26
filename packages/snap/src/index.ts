import { OnTransactionHandler } from '@metamask/snaps-sdk';
import { SecurityAnalyzer } from './security/analyzers/securityAnalyzer';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const analyzer = new SecurityAnalyzer();
  const report = await analyzer.analyzeTransaction(transaction);

  return {
    content: {
      risk: report.risk,
      warnings: report.warnings,
      recommendations: report.recommendations,
      contractInfo: report.contractInfo,
      phishingResults: report.phishingResults
    }
  };
}; 