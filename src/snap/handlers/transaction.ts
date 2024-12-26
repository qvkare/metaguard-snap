import { OnTransactionHandler, Panel } from '@metamask/snaps-sdk';
import { SecurityAnalyzer } from '../../core/analyzers/SecurityAnalyzer';
import { createSecurityPanel, createErrorPanel } from '../ui/components';
import { SnapResponse } from '../../types';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  try {
    const analyzer = new SecurityAnalyzer();
    const report = await analyzer.analyzeTransaction(transaction);
    
    return {
      content: createSecurityPanel(report)
    } as SnapResponse;
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return {
      content: createErrorPanel(error)
    } as SnapResponse;
  }
}; 