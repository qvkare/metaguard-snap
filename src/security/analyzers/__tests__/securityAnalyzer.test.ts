import { SecurityAnalyzer } from '../securityAnalyzer';
import { PhishingDetector } from '../../../services/phishingDetector';
import { EtherscanService } from '../../../services/etherscan';
import { Transaction } from '../../../types/common';

jest.mock('../../../services/phishingDetector');
jest.mock('../../../services/etherscan');

describe('SecurityAnalyzer', () => {
  let securityAnalyzer: SecurityAnalyzer;
  let mockPhishingDetector: jest.Mocked<PhishingDetector>;
  let mockEtherscanService: jest.Mocked<EtherscanService>;

  beforeEach(() => {
    mockPhishingDetector = {
      checkAddress: jest.fn().mockResolvedValue({
        isPhishing: false,
        confidence: 1.0,
        reason: null
      })
    } as unknown as jest.Mocked<PhishingDetector>;

    mockEtherscanService = {
      getContractInfo: jest.fn().mockResolvedValue({
        verified: true,
        name: 'Test Contract'
      })
    } as unknown as jest.Mocked<EtherscanService>;

    securityAnalyzer = new SecurityAnalyzer(mockPhishingDetector, mockEtherscanService);
  });

  it('should analyze transaction successfully', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '1000000000000000000'
    };

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result).toBeDefined();
    expect(result.risk).toBe('low');
    expect(result.warnings).toBeInstanceOf(Array);
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.securityChecks).toBeInstanceOf(Array);
    expect(mockPhishingDetector.checkAddress).toHaveBeenCalledWith(transaction.to);
    expect(mockEtherscanService.getContractInfo).toHaveBeenCalledWith(transaction.to);
  });

  it('should detect high risk transactions', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '10000000000000000000' // Yüksek değerli işlem
    };

    mockPhishingDetector.checkAddress.mockResolvedValueOnce({
      isPhishing: true,
      confidence: 0.9,
      reason: 'Suspicious activity detected'
    });

    mockEtherscanService.getContractInfo.mockResolvedValueOnce({
      verified: false,
      name: 'Unknown Contract'
    });

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.risk).toBe('high');
    expect(result.warnings).toContain('Suspicious activity detected');
    expect(result.securityChecks.some(check => check.severity === 'HIGH')).toBe(true);
  });

  it('should handle missing destination address', async () => {
    const transaction: Transaction = {
      value: '1000000000000000000'
    };

    await expect(securityAnalyzer.analyzeTransaction(transaction))
      .rejects
      .toThrow('Transaction destination address is required');
  });

  it('should generate appropriate recommendations based on risk level', async () => {
    const transaction: Transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: '10000000000000000000'
    };

    mockPhishingDetector.checkAddress.mockResolvedValueOnce({
      isPhishing: true,
      confidence: 0.9,
      reason: 'Known phishing address'
    });

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.recommendations).toContain('Review transaction carefully before proceeding');
    expect(result.recommendations).toContain('Consider using a different contract or service');
  });
});