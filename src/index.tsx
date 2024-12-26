import { OnTransactionHandler, Panel, text, heading } from '@metamask/snaps-sdk';
import { SecurityAnalyzer } from './security/analyzers/securityAnalyzer';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  try {
    const analyzer = new SecurityAnalyzer();
    const report = await analyzer.analyzeTransaction(transaction);

    return {
      content: {
        type: 'panel',
        children: [
          { type: 'heading', value: 'Security Analysis Report' },
          {
            type: 'text',
            value: `Risk Level: ${report.risk.toUpperCase()}`,
          },
          ...(report.warnings.length > 0
            ? [
                { type: 'heading', value: 'Warnings:' },
                ...report.warnings.map((warning) => ({
                  type: 'text',
                  value: warning,
                })),
              ]
            : []),
          ...(report.recommendations.length > 0
            ? [
                { type: 'heading', value: 'Recommendations:' },
                ...report.recommendations.map((rec) => ({
                  type: 'text',
                  value: rec,
                })),
              ]
            : []),
          ...(report.securityChecks.length > 0
            ? [
                { type: 'heading', value: 'Security Checks:' },
                ...report.securityChecks.map((check) => ({
                  type: 'text',
                  value: `${check.name}: ${check.passed ? 'Passed' : 'Failed'} (${check.severity})${
                    check.details ? `\n${check.details}` : ''
                  }`,
                })),
              ]
            : []),
        ],
      },
    };
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return {
      content: {
        type: 'panel',
        children: [
          { type: 'heading', value: 'Error analyzing transaction' },
          {
            type: 'text',
            value: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      },
    };
  }
};
