import { onTransaction } from '../../../snap/handlers/transaction';
import { SecurityAnalyzer } from '../../../core/analyzers/SecurityAnalyzer';
import { type Transaction } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import type { CustomPanel } from '../../../types';

jest.mock('../../../core/analyzers/SecurityAnalyzer');

describe('Transaction Handler', () => {
  let mockSecurityAnalyzer: jest.Mocked<SecurityAnalyzer>;

  beforeEach(() => {
    mockSecurityAnalyzer = {
      analyzeTransaction: jest.fn().mockResolvedValue({
        risk: 'medium',
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
        contractInfo: {
          verified: true,
          name: 'TestContract',
        },
        phishingResults: {
          isPhishing: false,
          confidence: 1.0,
        },
        riskAssessment: {
          riskLevel: 'medium',
          riskScore: 0.5,
          details: ['High value transaction'],
        },
        timestamp: Date.now(),
      }),
    } as unknown as jest.Mocked<SecurityAnalyzer>;

    (SecurityAnalyzer as jest.Mock).mockImplementation(() => mockSecurityAnalyzer);
  });

  it('should create security panel for normal transaction', async () => {
    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
    } as Transaction;

    const result = await onTransaction({ 
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com'
    });
    
    expect(result).toBeDefined();
    if (!result) throw new Error('Result should be defined');
    
    const panel = result.content as CustomPanel;
    expect(panel.type).toBe('panel');
    expect(panel.children).toBeDefined();
    expect(panel.children[0]).toEqual({
      type: NodeType.Heading,
      value: 'Security Analysis Report'
    });
  });

  it('should create error panel for failed analysis', async () => {
    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
    } as Transaction;

    mockSecurityAnalyzer.analyzeTransaction.mockRejectedValueOnce(
      new Error('Analysis failed')
    );

    const result = await onTransaction({ 
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com'
    });
    
    expect(result).toBeDefined();
    if (!result) throw new Error('Result should be defined');
    
    const panel = result.content as CustomPanel;
    expect(panel.type).toBe('panel');
    expect(panel.children).toBeDefined();
    expect(panel.children[0]).toEqual({
      type: NodeType.Heading,
      value: 'Error analyzing transaction'
    });
  });
}); 