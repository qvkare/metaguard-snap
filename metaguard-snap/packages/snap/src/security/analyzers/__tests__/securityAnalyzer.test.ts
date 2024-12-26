import { describe, expect, test, jest } from '@jest/globals';
import { SecurityAnalyzer } from '../securityAnalyzer';
import { PhishingDetector } from '../../../services/phishingDetector';
import { MLModel } from '../../../ml/models/mlModel';
import { EtherscanService } from '../../../services/etherscan';
import { type Transaction, type EIP1559Transaction, type LegacyTransaction } from '@metamask/snaps-sdk';

// Mock dependencies
jest.mock('../../../services/phishingDetector');
jest.mock('../../../ml/models/mlModel');
jest.mock('../../../services/etherscan');

describe('SecurityAnalyzer', () => {
  let analyzer: SecurityAnalyzer;
  let mockPhishingDetector: jest.Mocked<PhishingDetector>;
  let mockMLModel: jest.Mocked<MLModel>;
  let mockEtherscanService: jest.Mocked<EtherscanService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPhishingDetector = new PhishingDetector() as jest.Mocked<PhishingDetector>;
    mockMLModel = new MLModel() as jest.Mocked<MLModel>;
    mockEtherscanService = new EtherscanService('fake-api-key') as jest.Mocked<EtherscanService>;

    // Initialize analyzer with mocks
    analyzer = new SecurityAnalyzer();
  });

  test('should detect contract creation transactions', async () => {
    const transaction = {
      from: '0x123...',
      to: null,
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('This transaction creates a new contract');
    expect(result.recommendations).toContain('Review the contract code carefully before deployment');
  });

  test('should detect high value transactions', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '2000000000000000000', // 2 ETH
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('High value transaction');
    expect(result.recommendations).toContain('Double check the recipient address');
  });

  test('should detect high gas fees in EIP-1559 transactions', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      maxFeePerGas: '200000000000', // 200 Gwei
      maxPriorityFeePerGas: '2000000000',
      chainId: 1,
      type: 2
    } as EIP1559Transaction;

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('High gas fee');
    expect(result.recommendations).toContain('Consider waiting for lower gas prices');
  });

  test('should detect high gas fees in legacy transactions', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '200000000000', // 200 Gwei
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('High gas fee');
    expect(result.recommendations).toContain('Consider waiting for lower gas prices');
  });

  test('should detect unverified contracts', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    mockEtherscanService.getContractInfo.mockResolvedValue({
      verified: false
    });

    mockPhishingDetector.checkAddress.mockResolvedValue({
      isPhishing: false,
      confidence: 1.0
    });

    mockMLModel.predict.mockResolvedValue(0.1);

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('Unverified contract');
    expect(result.recommendations).toContain('Exercise caution when interacting with unverified contracts');
  });

  test('should detect phishing risks', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    mockEtherscanService.getContractInfo.mockResolvedValue({
      verified: true
    });

    mockPhishingDetector.checkAddress.mockResolvedValue({
      isPhishing: true,
      confidence: 0.95,
      reason: 'Known scam contract'
    });

    mockMLModel.predict.mockResolvedValue(0.9);

    const result = await analyzer.analyzeTransaction(transaction);

    expect(result.warnings).toContain('Potential phishing risk: Known scam contract');
    expect(result.recommendations).toContain('Avoid interacting with this address');
    expect(result.risk).toBe('high');
  });

  test('should calculate risk levels correctly', async () => {
    const transaction = {
      from: '0x123...',
      to: '0x456...',
      value: '0',
      data: '0x...',
      nonce: '0x0',
      gas: '0x5208',
      gasPrice: '0x4a817c800',
      chainId: 1,
      type: 0
    } as LegacyTransaction;

    // Test low risk
    mockEtherscanService.getContractInfo.mockResolvedValue({
      verified: true
    });

    mockPhishingDetector.checkAddress.mockResolvedValue({
      isPhishing: false,
      confidence: 1.0
    });

    mockMLModel.predict.mockResolvedValue(0.1);

    let result = await analyzer.analyzeTransaction(transaction);
    expect(result.risk).toBe('low');

    // Test medium risk
    mockMLModel.predict.mockResolvedValue(0.6);
    result = await analyzer.analyzeTransaction(transaction);
    expect(result.risk).toBe('medium');

    // Test high risk
    mockMLModel.predict.mockResolvedValue(0.9);
    result = await analyzer.analyzeTransaction(transaction);
    expect(result.risk).toBe('high');
  });
}); 