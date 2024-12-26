import { onTransaction } from '../../snap/handlers/transaction';
import { SecurityAnalyzer } from '../../core/analyzers/SecurityAnalyzer';
import { type Transaction } from '@metamask/snaps-sdk';
import { SecurityReport, RiskLevel } from '../../types';

jest.mock('../../core/analyzers/SecurityAnalyzer');

describe('onTransaction', () => {
  const mockReport: SecurityReport = {
    riskLevel: 'MEDIUM' as RiskLevel,
    riskScore: 0.5,
    warnings: ['High value transaction'],
    recommendations: ['Review transaction carefully'],
    securityChecks: [
      {
        name: 'Value Check',
        passed: false,
        details: 'High value transaction',
        severity: 'MEDIUM',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SecurityAnalyzer as jest.Mock).mockImplementation(() => ({
      analyzeTransaction: jest.fn().mockResolvedValue(mockReport),
    }));
  });

  it('should analyze transaction and return security report', async () => {
    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
    } as Transaction;

    const result = await onTransaction({
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com',
    });

    expect(result).toBeDefined();
    expect(result.content.type).toBe('panel');
    expect(result.content.children).toHaveLength(9);
    expect(result.content.children[0].type).toBe('heading');
    expect(result.content.children[0].value).toBe('Security Analysis Report');
    expect(result.content.children[1].type).toBe('text');
    expect(result.content.children[1].value).toBe('Risk Level: MEDIUM');
  });

  it('should handle high risk transactions', async () => {
    const highRiskReport: SecurityReport = {
      riskLevel: 'HIGH' as RiskLevel,
      riskScore: 0.9,
      warnings: ['Potential phishing attack detected'],
      recommendations: ['Do not proceed with the transaction'],
      securityChecks: [
        {
          name: 'Phishing Check',
          passed: false,
          details: 'Suspicious contract behavior',
          severity: 'HIGH',
        },
      ],
    };

    (SecurityAnalyzer as jest.Mock).mockImplementation(() => ({
      analyzeTransaction: jest.fn().mockResolvedValue(highRiskReport),
    }));

    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '10000000000000000000',
    } as Transaction;

    const result = await onTransaction({
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com',
    });

    expect(result).toBeDefined();
    expect(result.content.type).toBe('panel');
    expect(result.content.children).toHaveLength(9);
    expect(result.content.children[0].type).toBe('heading');
    expect(result.content.children[0].value).toBe('Security Analysis Report');
    expect(result.content.children[1].type).toBe('text');
    expect(result.content.children[1].value).toBe('Risk Level: HIGH');
  });
});
