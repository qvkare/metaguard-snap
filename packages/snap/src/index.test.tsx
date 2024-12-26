import { onTransaction } from '.';
import { SecurityAnalyzer } from './security/analyzers/securityAnalyzer';

jest.mock('./security/analyzers/securityAnalyzer');

describe('onTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze transaction and return security report', async () => {
    const mockReport = {
      risk: 'low',
      warnings: ['Test warning'],
      recommendations: ['Test recommendation'],
      contractInfo: {
        verified: true,
        name: 'TestContract',
      },
      phishingResults: {
        isPhishing: false,
        confidence: 1,
      },
    };

    (SecurityAnalyzer.prototype.analyzeTransaction as jest.Mock).mockResolvedValue(
      mockReport
    );

    const mockTransaction = {
      from: '0x123...',
      to: '0x456...',
      value: '1000000000000000000',
      data: '0x',
    };

    const result = await onTransaction(mockTransaction);

    expect(result.content).toEqual({
      risk: mockReport.risk,
      warnings: mockReport.warnings,
      recommendations: mockReport.recommendations,
      contractInfo: mockReport.contractInfo,
      phishingResults: mockReport.phishingResults,
    });
  });

  it('should handle errors gracefully', async () => {
    (SecurityAnalyzer.prototype.analyzeTransaction as jest.Mock).mockRejectedValue(
      new Error('Analysis failed')
    );

    const mockTransaction = {
      from: '0x123...',
      to: '0x456...',
      value: '1000000000000000000',
      data: '0x',
    };

    const result = await onTransaction(mockTransaction);

    expect(result.content).toEqual({
      risk: 'high',
      warnings: ['Error analyzing transaction'],
      recommendations: ['Please try again or contact support if the issue persists'],
      contractInfo: undefined,
      phishingResults: undefined,
    });
  });
});
