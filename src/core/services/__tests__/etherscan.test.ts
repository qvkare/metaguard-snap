import { EtherscanService } from '../etherscan';
import { HttpClient } from '../../utils/httpClient';
import { ContractInfo } from '../../types/common';

jest.mock('../../utils/httpClient');

describe('EtherscanService', () => {
  let etherscanService: EtherscanService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = new HttpClient('') as jest.Mocked<HttpClient>;
    etherscanService = new EtherscanService(mockHttpClient, 'test-api-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getContractInfo', () => {
    it('should return contract info for verified contract', async () => {
      const address = '0x123';
      mockHttpClient.get.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: [
          {
            ABI: '[]',
            ContractName: 'TestContract',
          },
        ],
      });

      const result = await etherscanService.getContractInfo(address);

      expect(result.verified).toBe(true);
      expect(result.name).toBe('TestContract');
      expect(mockHttpClient.get).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          address,
          apikey: 'test-api-key',
        }),
      });
    });

    it('should return unverified status for unverified contract', async () => {
      const address = '0x456';
      mockHttpClient.get.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: [
          {
            ABI: 'Contract source code not verified',
          },
        ],
      });

      const result = await etherscanService.getContractInfo(address);

      expect(result.verified).toBe(false);
      expect(result.name).toBeUndefined();
    });

    it('should throw error for invalid address', async () => {
      await expect(etherscanService.getContractInfo('')).rejects.toThrow('Address is required');
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw error for API failure', async () => {
      const address = '0x789';
      mockHttpClient.get.mockRejectedValue(new Error('API error'));

      await expect(etherscanService.getContractInfo(address)).rejects.toThrow(
        'Failed to fetch contract information',
      );
    });
  });
});
