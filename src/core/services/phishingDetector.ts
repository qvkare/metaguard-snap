import axios from 'axios';
import { Cache } from '../../utils/cache';

interface PhishingCheckResult {
  isPhishing: boolean;
  confidence: number;
  reason: string;
}

export class PhishingDetector {
  private cache: Cache;
  private readonly apiUrl: string;

  constructor() {
    this.cache = new Cache();
    this.apiUrl = process.env.PHISHING_API_URL || 'https://api.phishfort.com/check';
  }

  async checkAddress(address: string): Promise<PhishingCheckResult> {
    if (!this.isValidAddress(address)) {
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Invalid address format'
      };
    }

    const cachedResult = this.cache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/${address}`);
      const result: PhishingCheckResult = {
        isPhishing: response.data.result.isPhishing,
        confidence: response.data.result.confidence,
        reason: response.data.result.reason
      };

      this.cache.set(address, result);
      return result;
    } catch (error) {
      console.error('Phishing check failed:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'API check failed'
      };
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}
