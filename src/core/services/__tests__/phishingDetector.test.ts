import { PhishingDetector } from '../phishingDetector';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PhishingDetector', () => {
  let phishingDetector: PhishingDetector;
  const testAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    phishingDetector = new PhishingDetector();
    jest.clearAllMocks();
  });

  test('should detect phishing address', async () => {
    const mockResponse = {
      data: {
        result: {
          isPhishing: true,
          confidence: 0.9,
          reason: 'Known phishing address'
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(true);
    expect(result.confidence).toBe(0.9);
    expect(result.reason).toBe('Known phishing address');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle safe address', async () => {
    const mockResponse = {
      data: {
        result: {
          isPhishing: false,
          confidence: 0,
          reason: 'No phishing detected'
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe('No phishing detected');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle API errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe('API check failed');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should validate address format', async () => {
    const invalidAddress = 'invalid-address';
    
    const result = await phishingDetector.checkAddress(invalidAddress);
    
    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe('Invalid address format');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('should use cached results', async () => {
    const mockResponse = {
      data: {
        result: {
          isPhishing: true,
          confidence: 0.9,
          reason: 'Known phishing address'
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    // First call
    await phishingDetector.checkAddress(testAddress);
    // Second call should use cache
    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(true);
    expect(result.confidence).toBe(0.9);
    expect(result.reason).toBe('Known phishing address');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
