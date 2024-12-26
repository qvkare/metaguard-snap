import { PhishingDetector } from '../phishingDetector';
import axios from 'axios';
import { CacheManager } from '../../utils/cache';

jest.mock('axios');
jest.mock('../../utils/cache');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PhishingDetector', () => {
  let phishingDetector: PhishingDetector;
  let mockCache: jest.Mocked<CacheManager>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
    } as unknown as jest.Mocked<CacheManager>;

    phishingDetector = new PhishingDetector(mockCache);
  });

  it('should detect phishing address', async () => {
    const testAddress = '0x1234567890123456789012345678901234567890';

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        result: { is_phishing: true },
        status: 1,
      },
    });

    mockCache.has.mockReturnValue(false);

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalled();
  });

  it('should return cached result if available', async () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    const cachedResult = {
      isPhishing: false,
      confidence: 1.0,
      reason: 'Cached result',
    };

    mockCache.has.mockReturnValue(true);
    mockCache.get.mockReturnValue(cachedResult);

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result).toEqual(cachedResult);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const testAddress = '0x1234567890123456789012345678901234567890';

    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    mockCache.has.mockReturnValue(false);

    const result = await phishingDetector.checkAddress(testAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(0.5);
    expect(result.reason).toBe('Error checking address');
  });

  it('should validate address format', async () => {
    const invalidAddress = 'invalid-address';

    const result = await phishingDetector.checkAddress(invalidAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBe('Invalid address format');
  });

  it('should handle empty address', async () => {
    const emptyAddress = '';

    const result = await phishingDetector.checkAddress(emptyAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBe('Invalid address');
  });
});
