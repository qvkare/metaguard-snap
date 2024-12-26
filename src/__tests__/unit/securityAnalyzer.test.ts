import { SecurityAnalyzer } from '../../core/analyzers/SecurityAnalyzer';
import { PhishingDetector } from '../../core/services/phishingDetector';
import { EtherscanService } from '../../core/services/etherscan';
import { Transaction, SecurityReport } from '../../types';

jest.mock('../../core/services/phishingDetector');
jest.mock('../../core/services/etherscan');

describe('SecurityAnalyzer', () => {
  let securityAnalyzer: SecurityAnalyzer;
  let mockPhishingDetector: jest.Mocked<PhishingDetector>;
  let mockEtherscanService: jest.Mocked<EtherscanService>;

  beforeEach(() => {
    mockPhishingDetector = {
      isPhishingSite: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<PhishingDetector>;

    mockEtherscanService = {
      isContractVerified: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<EtherscanService>;

    securityAnalyzer = new SecurityAnalyzer(mockPhishingDetector, mockEtherscanService);
  });

  it('should analyze transaction successfully', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000',
    };

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result).toBeDefined();
    expect(result.riskLevel).toBe('LOW');
    expect(result.warnings).toBeInstanceOf(Array);
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.securityChecks).toBeInstanceOf(Array);
    expect(mockPhishingDetector.isPhishingSite).toHaveBeenCalledWith(transaction.to);
    expect(mockEtherscanService.isContractVerified).toHaveBeenCalledWith(transaction.to);
  });

  it('should handle contract creation transactions', async () => {
    const transaction: Transaction = {
      value: '1000000000000000000',
    };

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('Contract creation transaction detected');
    expect(result.recommendations).toContain('Review the contract code carefully before deployment');
  });

  it('should detect high risk transactions', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '10000000000000000000',
    };

    mockPhishingDetector.isPhishingSite.mockResolvedValueOnce(true);
    mockEtherscanService.isContractVerified.mockResolvedValueOnce(false);

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.riskLevel).toBe('HIGH');
    expect(result.securityChecks.some((check) => !check.passed && check.severity === 'HIGH')).toBe(true);
  });

  it('should handle value transfers', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: 'ff',
    };

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('Transaction involves value transfer');
    expect(result.recommendations).toContain('Verify the recipient address and amount before confirming');
  });
});
