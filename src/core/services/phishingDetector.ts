import { HttpClient } from '../../utils/httpClient';
import { PhishingResult } from '../types/common';

export class PhishingDetector {
  private readonly httpClient: HttpClient;
  private readonly metamaskApiUrl = 'https://phishing-detection.metaswap.codefi.network/v1/blacklist';
  private readonly goPlusApiUrl = 'https://api.gopluslabs.io/api/v1/address_security/';

  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || new HttpClient();
  }

  async checkAddress(address: string): Promise<PhishingResult> {
    try {
      const [metamaskResult, goPlusResult] = await Promise.all([
        this.checkMetaMaskList(address),
        this.checkGoPlusSecurity(address)
      ]);

      // Combine results with higher confidence taking precedence
      if (metamaskResult.isPhishing || goPlusResult.isPhishing) {
        return {
          isPhishing: true,
          confidence: Math.max(metamaskResult.confidence, goPlusResult.confidence),
          reason: metamaskResult.isPhishing ? metamaskResult.reason : goPlusResult.reason
        };
      }

      return {
        isPhishing: false,
        confidence: Math.max(metamaskResult.confidence, goPlusResult.confidence),
        reason: 'No phishing detected'
      };
    } catch (error) {
      console.error('Error checking address for phishing:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error checking phishing status'
      };
    }
  }

  private async checkMetaMaskList(address: string): Promise<PhishingResult> {
    try {
      const response = await this.httpClient.get(this.metamaskApiUrl);
      const blacklist = response.data.blacklist || [];
      
      const isBlacklisted = blacklist.some(
        (item: string) => item.toLowerCase() === address.toLowerCase()
      );

      return {
        isPhishing: isBlacklisted,
        confidence: isBlacklisted ? 1.0 : 0.5,
        reason: isBlacklisted ? 'Address found in MetaMask blacklist' : undefined
      };
    } catch (error) {
      console.error('Error checking MetaMask blacklist:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error checking MetaMask blacklist'
      };
    }
  }

  private async checkGoPlusSecurity(address: string): Promise<PhishingResult> {
    try {
      const response = await this.httpClient.get(`${this.goPlusApiUrl}${address}`);
      const securityInfo = response.data.result || {};

      const isPhishing = securityInfo.is_phishing_site === '1' || 
                        securityInfo.is_blacklisted === '1';

      return {
        isPhishing,
        confidence: isPhishing ? 0.9 : 0.7,
        reason: isPhishing ? 'Address flagged by GoPlus Security' : undefined
      };
    } catch (error) {
      console.error('Error checking GoPlus Security:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error checking GoPlus Security'
      };
    }
  }
} 