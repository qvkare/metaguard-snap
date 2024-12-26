import axios from 'axios';

export interface MetaMaskPhishingResult {
  isPhishing: boolean;
  confidence: number;
  reason?: string;
}

export class MetaMaskPhishingService {
  private readonly phishingListUrl = 'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json';
  private phishingList: any = null;
  private lastUpdate: number = 0;
  private readonly updateInterval = 3600000; // 1 saat

  async checkAddress(address: string): Promise<MetaMaskPhishingResult> {
    try {
      await this.updatePhishingList();
      
      const normalizedAddress = address.toLowerCase();
      
      // Doğrudan adres kontrolü
      if (this.phishingList.blacklist.includes(normalizedAddress)) {
        return {
          isPhishing: true,
          confidence: 1.0,
          reason: 'Address is in MetaMask blacklist'
        };
      }

      // Whitelist kontrolü
      if (this.phishingList.whitelist.includes(normalizedAddress)) {
        return {
          isPhishing: false,
          confidence: 1.0,
          reason: 'Address is in MetaMask whitelist'
        };
      }

      // Fuzzy matching kontrolü
      const fuzzyMatch = this.phishingList.fuzzylist.find((entry: any) => {
        if (typeof entry === 'string') {
          return normalizedAddress.includes(entry);
        }
        return false;
      });

      if (fuzzyMatch) {
        return {
          isPhishing: true,
          confidence: 0.8,
          reason: 'Address matches fuzzy phishing pattern'
        };
      }

      return {
        isPhishing: false,
        confidence: 0.9,
        reason: undefined
      };
    } catch (error) {
      console.error('Error checking MetaMask phishing list:', error);
      return {
        isPhishing: false,
        confidence: 0,
        reason: 'Error checking phishing status'
      };
    }
  }

  private async updatePhishingList(): Promise<void> {
    const now = Date.now();
    if (this.phishingList && now - this.lastUpdate < this.updateInterval) {
      return;
    }

    try {
      const response = await axios.get(this.phishingListUrl);
      this.phishingList = response.data;
      this.lastUpdate = now;
    } catch (error) {
      console.error('Error updating phishing list:', error);
      if (!this.phishingList) {
        this.phishingList = { blacklist: [], whitelist: [], fuzzylist: [] };
      }
    }
  }
} 