import { onTransaction } from '.';
import { SecurityAnalyzer } from './security/analyzers/securityAnalyzer';
import { type Transaction } from '@metamask/snaps-sdk';
import { Panel, NodeType } from '@metamask/snaps-sdk';

jest.mock('./security/analyzers/securityAnalyzer');

describe('onTransaction', () => {
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

  it('should analyze transaction and return security report', async () => {
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
    
    expect(result.content).toBeDefined();
    const content = result.content;
    expect(content).toHaveProperty('type', NodeType.Panel);
  });

  it('should handle errors gracefully', async () => {
    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
    } as Transaction;

    mockSecurityAnalyzer.analyzeTransaction.mockRejectedValueOnce(new Error('Analysis failed'));

    const result = await onTransaction({ 
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com'
    });
    
    expect(result).toBeDefined();
    if (!result) throw new Error('Result should be defined');
    
    expect(result.content).toBeDefined();
    const content = result.content;
    expect(content).toHaveProperty('type', NodeType.Panel);
  });

  it('should handle high risk transactions', async () => {
    mockSecurityAnalyzer.analyzeTransaction.mockResolvedValueOnce({
      risk: 'high',
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
      contractInfo: {
        verified: false,
        name: 'Unknown Contract',
      },
      phishingResults: {
        isPhishing: true,
        confidence: 0.9,
      },
      riskAssessment: {
        riskLevel: 'high',
        riskScore: 0.9,
        details: ['Potential phishing attack detected'],
      },
      timestamp: Date.now(),
    });

    const mockTransaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '10000000000000000000',
    } as Transaction;

    const result = await onTransaction({ 
      transaction: mockTransaction,
      chainId: 'eip155:1',
      transactionOrigin: 'dapp.example.com'
    });

    expect(result).toBeDefined();
    if (!result) throw new Error('Result should be defined');
    
    const content = result.content;
    expect(content).toHaveProperty('type', NodeType.Panel);
  });
}); 