import axios from 'axios';
import { PhishingDetector } from '../phishingDetector';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PhishingDetector', () => {
  let detector: PhishingDetector;

  beforeEach(() => {
    detector = new PhishingDetector();
    jest.clearAllMocks();
  });

  test('should detect known phishing addresses', async () => {
    const knownPhishingAddress = '0x123...';
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        isPhishing: true,
        confidence: 0.95,
        reason: 'Known phishing address'
      }
    });

    const result = await detector.checkAddress(knownPhishingAddress);

    expect(result.isPhishing).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.reason).toBeDefined();
  });

  test('should return safe for unknown addresses', async () => {
    const unknownAddress = '0xabc...';
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        isPhishing: false,
        confidence: 1.0
      }
    });

    const result = await detector.checkAddress(unknownAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBeUndefined();
  });

  test('should handle invalid addresses gracefully', async () => {
    const invalidAddress = 'invalid';
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        isPhishing: false,
        confidence: 1.0
      }
    });

    const result = await detector.checkAddress(invalidAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBeUndefined();
  });

  test('should handle API errors gracefully', async () => {
    const address = '0x123...';
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const result = await detector.checkAddress(address);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe('API check failed');
  });

  test('should use cache for repeated checks', async () => {
    const address = '0x123...';
    const mockResponse = {
      data: {
        isPhishing: true,
        confidence: 0.95,
        reason: 'Known phishing address'
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    // First call - should hit API
    const result1 = await detector.checkAddress(address);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(result1.isPhishing).toBe(true);

    // Second call - should use cache
    const result2 = await detector.checkAddress(address);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(result2.isPhishing).toBe(true);
  });
}); 