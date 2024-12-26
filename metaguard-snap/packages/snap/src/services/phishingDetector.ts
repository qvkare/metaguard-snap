import axios from 'axios';

export interface PhishingCheckResult {
  isPhishing: boolean;
  confidence: number;
  reason?: string;
}

interface MetaMaskBlacklist {
  blacklist: string[];
}

interface GoPlusSecurityResult {
  result: {
    is_honeypot?: number;
    is_proxy?: number;
    is_blacklisted?: number;
    honeypot_related_address?: string[];
  };
}

export class PhishingDetector {
  private phishingDatabase: Map<string, PhishingCheckResult>;
  private knownPhishingAddresses: Set<string>;

  constructor() {
    this.phishingDatabase = new Map();
    this.knownPhishingAddresses = new Set([
      '0x123456789abcdef', // Test address for known phishing
    ]);
  }

  async checkAddress(address: string): Promise<PhishingCheckResult> {
    const normalizedAddress = address.toLowerCase();

    // Check cache
    const cachedResult = this.phishingDatabase.get(normalizedAddress);
    if (cachedResult) {
      return cachedResult;
    }

    // Check known phishing addresses
    if (this.knownPhishingAddresses.has(normalizedAddress)) {
      const result = {
        isPhishing: true,
        confidence: 1.0,
        reason: 'Known phishing address'
      };
      this.phishingDatabase.set(normalizedAddress, result);
      return result;
    }

    try {
      // Check MetaMask blacklist
      const metamaskResponse = await axios.get<MetaMaskBlacklist>('https://metamask.github.io/eth-phishing-detect/blacklist.json');
      const metamaskResult = await this.checkMetaMaskList(address, metamaskResponse.data);
      if (metamaskResult.isPhishing) {
        this.phishingDatabase.set(normalizedAddress, metamaskResult);
        return metamaskResult;
      }

      // Check GoPlus Security API
      const goPlusResponse = await axios.get<GoPlusSecurityResult>(`https://api.gopluslabs.io/api/v1/token_security/${address}`);
      const goPlusResult = await this.checkGoPlusSecurity(address, goPlusResponse.data);
      if (goPlusResult.isPhishing) {
        this.phishingDatabase.set(normalizedAddress, goPlusResult);
        return goPlusResult;
      }

      // Check Etherscan blacklist
      const etherscanResponse = await axios.get<string[]>('https://api.etherscan.io/api?module=blacklist&action=addresses');
      const etherscanResult = await this.checkEtherscanList(address, etherscanResponse.data);
      if (etherscanResult.isPhishing) {
        this.phishingDatabase.set(normalizedAddress, etherscanResult);
        return etherscanResult;
      }

      // If no phishing detected, cache and return safe result
      const safeResult = {
        isPhishing: false,
        confidence: 1.0,
        reason: 'No phishing indicators detected'
      };
      this.phishingDatabase.set(normalizedAddress, safeResult);
      return safeResult;
    } catch (error) {
      // Return safe by default if API calls fail
      const errorResult = {
        isPhishing: false,
        confidence: 1.0,
        reason: 'API error, defaulting to safe'
      };
      this.phishingDatabase.set(normalizedAddress, errorResult);
      return errorResult;
    }
  }

  async checkMetaMaskList(address: string, blacklist: MetaMaskBlacklist): Promise<PhishingCheckResult> {
    const isBlacklisted = blacklist.blacklist.includes(address.toLowerCase());
    return {
      isPhishing: isBlacklisted,
      confidence: isBlacklisted ? 0.9 : 1.0,
      reason: isBlacklisted ? 'Address is blacklisted by MetaMask' : undefined
    };
  }

  async checkGoPlusSecurity(address: string, data: GoPlusSecurityResult): Promise<PhishingCheckResult> {
    const result = data.result;
    const isHoneypot = result.is_honeypot === 1;
    const isProxy = result.is_proxy === 1;
    const isBlacklisted = result.is_blacklisted === 1;
    const isHoneypotRelated = result.honeypot_related_address?.includes(address);

    const isPhishing = isHoneypot || isBlacklisted || isHoneypotRelated;
    let confidence = 0.5;

    if (isHoneypot) confidence += 0.3;
    if (isBlacklisted) confidence += 0.3;
    if (isProxy) confidence += 0.1;
    if (isHoneypotRelated) confidence += 0.2;

    return {
      isPhishing,
      confidence: Math.min(confidence, 1.0),
      reason: isPhishing ? 'Security issues detected by GoPlus' : undefined
    };
  }

  async checkEtherscanList(address: string, blacklist: string[]): Promise<PhishingCheckResult> {
    const isBlacklisted = blacklist.includes(address.toLowerCase());
    return {
      isPhishing: isBlacklisted,
      confidence: isBlacklisted ? 0.95 : 1.0,
      reason: isBlacklisted ? 'Address is blacklisted by Etherscan' : undefined
    };
  }
} 