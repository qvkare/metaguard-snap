import { divider, heading, panel, text } from '@metamask/snaps-sdk';
import { SecurityReport } from '../../types';

export const createTransactionReport = (report: SecurityReport) => {
  if (!report) {
    return panel([
      heading('Error'),
      text('Failed to generate security report'),
    ]);
  }

  return panel([
    heading('Security Analysis Report'),
    text(`Risk Level: ${report.riskLevel}`),
    text(`Risk Score: ${report.riskScore}`),
    divider(),
    heading('Warnings'),
    ...report.warnings.map((warning) => text(warning)),
    divider(),
    heading('Recommendations'),
    ...report.recommendations.map((rec) => text(rec)),
  ]);
};
