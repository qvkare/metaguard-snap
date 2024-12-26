import axios from 'axios';
import { EtherscanService } from '../etherscan';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EtherscanService', () => {
  let service: EtherscanService;

  beforeEach(() => {
    service = new EtherscanService();
    jest.clearAllMocks();
  });

  describe('getContractInfo', () => {
    test('should return contract info for verified contracts', async () => {
      const mockResponse = {
        data: {
          status: '1',
          result: JSON.stringify([{
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [{"name": "", "type": "string"}],
            "type": "function"
          }])
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getContractInfo('0x1234567890123456789012345678901234567890');
      expect(result.verified).toBe(true);
      expect(result.name).toBe('TestContract');
      expect(result.compiler).toBe('v0.8.0');
      expect(result.abi).toBeDefined();
    });

    test('should return unverified status for invalid addresses', async () => {
      const result = await service.getContractInfo('invalid');
      expect(result.verified).toBe(false);
    });

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      const result = await service.getContractInfo('0x1234567890123456789012345678901234567890');
      expect(result.verified).toBe(false);
    });
  });

  describe('getContractABI', () => {
    test('should return contract ABI when available', async () => {
      const mockABI = [{
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
      }];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: JSON.stringify(mockABI)
        }
      });

      const result = await service.getContractABI('0x1234567890123456789012345678901234567890');
      expect(result).toEqual(mockABI);
    });

    test('should throw error when ABI is not available', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '0',
          result: 'Contract source code not verified'
        }
      });

      await expect(service.getContractABI('0x1234567890123456789012345678901234567890')).rejects.toThrow('Contract ABI not available');
    });
  });

  describe('getContractTransactions', () => {
    test('should return transaction list when available', async () => {
      const mockTransactions = [{
        hash: '0x123...',
        value: '1000000000000000000'
      }];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '1',
          result: mockTransactions
        }
      });

      const result = await service.getContractTransactions('0x1234567890123456789012345678901234567890');
      expect(result).toEqual(mockTransactions);
    });

    test('should return empty array when no transactions found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: '0',
          result: []
        }
      });

      const result = await service.getContractTransactions('0x1234567890123456789012345678901234567890');
      expect(result).toEqual([]);
    });

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      const result = await service.getContractTransactions('0x1234567890123456789012345678901234567890');
      expect(result).toEqual([]);
    });
  });
}); 