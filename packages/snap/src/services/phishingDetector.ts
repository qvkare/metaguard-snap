import axios from 'axios';

interface PhishingCheckResult {
  isPhishing: boolean;
  confidence: number;
  reason?: string;
}

export class PhishingDetector {
  private cache: Map<string, PhishingCheckResult>;
  private readonly API_URL = 'https://api.etherscan.io/api';
  private readonly API_KEY = process.env.ETHERSCAN_API_KEY || '';

  constructor() {
    this.cache = new Map();
  }

  async checkAddress(address: string): Promise<PhishingCheckResult> {
    if (!address) {
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Invalid address'
      };
    }

    // Check cache first
    const cachedResult = this.cache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await axios.get(this.API_URL, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address,
          apikey: this.API_KEY
        }
      });

      const result = response.data;
      let isPhishing = false;
      let confidence = 0;
      let reason = undefined;

      if (result.status === '1' && result.result[0]) {
        const contractData = result.result[0];
        
        // Check if contract is verified
        if (contractData.ABI === 'Contract source code not verified') {
          confidence = 0.7;
          isPhishing = true;
          reason = 'Unverified contract';
        }
        
        // Check contract name for suspicious patterns
        if (contractData.ContractName && this.hasSuspiciousName(contractData.ContractName)) {
          confidence = Math.max(confidence, 0.8);
          isPhishing = true;
          reason = 'Suspicious contract name';
        }
      }

      const checkResult = {
        isPhishing,
        confidence,
        reason
      };

      // Cache the result
      this.cache.set(address, checkResult);

      return checkResult;
    } catch (error) {
      console.error('Error checking address:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error checking address'
      };
    }
  }

  private hasSuspiciousName(name: string): boolean {
    const suspiciousPatterns = [
      'token',
      'swap',
      'airdrop',
      'free',
      'bonus',
      'reward',
      'gift',
      'claim'
    ];

    const lowercaseName = name.toLowerCase();
    return suspiciousPatterns.some(pattern => lowercaseName.includes(pattern));
  }
} 