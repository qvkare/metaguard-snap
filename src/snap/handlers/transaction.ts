import { OnTransactionHandler } from '@metamask/snaps-sdk';
import { SecurityAnalyzer } from '../../core/analyzers/SecurityAnalyzer';
import { createTransactionReport } from '../ui/components';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const securityAnalyzer = new SecurityAnalyzer();
  const securityReport = await securityAnalyzer.analyzeTransaction(transaction);
  const panel = createTransactionReport(securityReport);
  return {
    content: panel,
  };
};
