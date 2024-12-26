import { SecurityAnalyzer } from '../securityAnalyzer';
import { PhishingDetector } from '../phishingDetector';
import { EtherscanService } from '../etherscan';
import { Transaction } from '../../../types';

jest.mock('../phishingDetector');
jest.mock('../etherscan');

describe('SecurityAnalyzer', () => {
  let securityAnalyzer: SecurityAnalyzer;
  let mockPhishingDetector: jest.Mocked<PhishingDetector>;
  let mockEtherscanService: jest.Mocked<EtherscanService>;

  beforeEach(() => {
    mockPhishingDetector = new PhishingDetector() as jest.Mocked<PhishingDetector>;
    mockEtherscanService = new EtherscanService() as jest.Mocked<EtherscanService>;
    securityAnalyzer = new SecurityAnalyzer(mockPhishingDetector, mockEtherscanService);

    mockEtherscanService.getContractInfo.mockResolvedValue({ verified: true });
  });

  test('should analyze a safe transaction', async () => {
    const transaction: Transaction = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: '1000000000000000000',
      data: '0x',
      nonce: '0',
      gas: '21000',
      gasPrice: '20000000000',
      estimateSuggested: '21000',
      estimateUsed: '21000'
    };

    mockPhishingDetector.checkAddress.mockResolvedValueOnce({
      isPhishing: false,
      confidence: 0,
      reason: 'No phishing detected'
    });

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.risk).toBe('low');
    expect(result.warnings).toHaveLength(0);
    expect(result.isSecure).toBe(true);
  });

  test('should detect phishing risk', async () => {
    const transaction: Transaction = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: '1000000000000000000',
      data: '0x',
      nonce: '0',
      gas: '21000',
      gasPrice: '20000000000',
      estimateSuggested: '21000',
      estimateUsed: '21000'
    };

    mockPhishingDetector.checkAddress.mockResolvedValueOnce({
      isPhishing: true,
      confidence: 0.8,
      reason: 'Known phishing address'
    });

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.risk).toBe('high');
    expect(result.warnings).toContain('Phishing risk detected');
    expect(result.isSecure).toBe(false);
  });

  test('should handle service errors', async () => {
    const transaction: Transaction = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: '1000000000000000000',
      data: '0x',
      nonce: '0',
      gas: '21000',
      gasPrice: '20000000000',
      estimateSuggested: '21000',
      estimateUsed: '21000'
    };

    mockPhishingDetector.checkAddress.mockRejectedValueOnce(new Error('Service error'));

    const result = await securityAnalyzer.analyzeTransaction(transaction);

    expect(result.risk).toBe('medium');
    expect(result.warnings).toContain('Unable to complete security checks');
    expect(result.isSecure).toBe(false);
  });
}); 