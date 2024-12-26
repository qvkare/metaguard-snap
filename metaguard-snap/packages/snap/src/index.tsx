import { type OnTransactionHandler } from '@metamask/snaps-sdk';
import { type OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text, heading } from '@metamask/snaps-sdk';
import { SecurityAnalyzer } from './security/analyzers/securityAnalyzer';

const securityAnalyzer = new SecurityAnalyzer();

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const securityReport = await securityAnalyzer.analyzeTransaction(transaction);

  return {
    content: panel([
      heading('MetaGuard Security Analysis'),
      text(`Risk Level: ${securityReport.riskLevel}`),
      text(`Contract Status: ${securityReport.contractInfo?.isVerified ? 'Verified' : 'Unverified'}`),
      text(`Phishing Risk: ${securityReport.phishingResults?.isPhishing ? 'High' : 'Low'}`),
      text(`Recommendations: ${securityReport.recommendations.join(', ')}`)
    ])
  };
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'analyze':
      return await securityAnalyzer.analyzeTransaction(request.params[0]);
    default:
      throw new Error('Method not found.');
  }
};
