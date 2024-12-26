import { EtherscanService } from '../etherscan';
import { mockedAxios } from '../../tests/setup';

describe('EtherscanService', () => {
  let service: EtherscanService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EtherscanService();
  });

  describe('getContractInfo', () => {
    test('should return contract info for verified contracts', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: [{
            ContractName: 'TestContract',
            CompilerVersion: 'v0.8.0',
            ABI: '[{"type":"function","name":"transfer"}]',
            SourceCode: 'contract TestContract {}',
          }],
        },
      });

      const result = await service.getContractInfo('0x123...');
      expect(result.verified).toBe(true);
      expect(result.name).toBe('TestContract');
      expect(result.compiler).toBe('v0.8.0');
      expect(result.abi).toBeDefined();
      expect(result.sourceCode).toBeDefined();
    });

    test('should return unverified status for unverified contracts', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: [{
            ContractName: '',
            ABI: 'Contract source code not verified',
          }],
        },
      });

      const result = await service.getContractInfo('0x123...');
      expect(result.verified).toBe(false);
    });

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.getContractInfo('0x123...');
      expect(result.verified).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getContractABI', () => {
    test('should return contract ABI when available', async () => {
      const mockABI = '[{"type":"function","name":"transfer"}]';
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: mockABI,
        },
      });

      const result = await service.getContractABI('0x123...');
      expect(result).toBe(mockABI);
    });

    test('should throw error when ABI is not available', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '0',
          result: 'Contract source code not verified',
        },
      });

      await expect(service.getContractABI('0x123...')).rejects.toThrow();
    });
  });

  describe('getContractTransactions', () => {
    test('should return transaction list when available', async () => {
      const mockTransactions = [
        { hash: '0x123...', value: '1000000000000000000' }
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: mockTransactions,
        },
      });

      const result = await service.getContractTransactions('0x123...');
      expect(result).toEqual(mockTransactions);
    });

    test('should return empty array when no transactions found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '0',
          result: [],
        },
      });

      const result = await service.getContractTransactions('0x123...');
      expect(result).toEqual([]);
    });

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.getContractTransactions('0x123...');
      expect(result).toEqual([]);
    });
  });
}); 