import axios from 'axios';
import { EtherscanService } from '../etherscan';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EtherscanService', () => {
  let etherscanService: EtherscanService;
  const testAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    etherscanService = new EtherscanService();
    jest.clearAllMocks();
  });

  test('should fetch transaction history', async () => {
    const mockResponse = {
      data: {
        status: '1',
        result: [{
          hash: '0xabc',
          from: testAddress,
          to: '0xdef',
          value: '1000000000000000000',
          timeStamp: '1634567890'
        }]
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await etherscanService.getTransactionHistory(testAddress);

    expect(result).toEqual([{
      hash: '0xabc',
      from: testAddress,
      to: '0xdef',
      value: '1000000000000000000',
      timestamp: 1634567890
    }]);
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  test('should handle API errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const result = await etherscanService.getTransactionHistory(testAddress);

    expect(result).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalled();
  });

  test('should validate address format', async () => {
    const invalidAddress = 'invalid-address';
    
    const result = await etherscanService.getTransactionHistory(invalidAddress);
    
    expect(result).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('should handle API rate limits', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    const result = await etherscanService.getTransactionHistory(testAddress);

    expect(result).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalled();
  });
});
