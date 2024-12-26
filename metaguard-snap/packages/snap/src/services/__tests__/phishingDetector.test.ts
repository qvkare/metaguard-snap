import { describe, expect, test, jest } from '@jest/globals';
import { PhishingDetector } from '../phishingDetector';

describe('PhishingDetector', () => {
  let detector: PhishingDetector;

  beforeEach(() => {
    detector = new PhishingDetector();
  });

  test('should detect known phishing addresses', async () => {
    const knownPhishingAddress = '0x123...';
    const result = await detector.checkAddress(knownPhishingAddress);

    expect(result.isPhishing).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.reason).toBeDefined();
  });

  test('should return safe for unknown addresses', async () => {
    const unknownAddress = '0xabc...';
    const result = await detector.checkAddress(unknownAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBeUndefined();
  });

  test('should handle invalid addresses gracefully', async () => {
    const invalidAddress = 'invalid';
    const result = await detector.checkAddress(invalidAddress);

    expect(result.isPhishing).toBe(false);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toBeUndefined();
  });

  test('should maintain consistent results for the same address', async () => {
    const address = '0x123...';
    const result1 = await detector.checkAddress(address);
    const result2 = await detector.checkAddress(address);

    expect(result1).toEqual(result2);
  });
}); 