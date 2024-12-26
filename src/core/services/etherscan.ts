import axios from 'axios';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export class EtherscanService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.ETHERSCAN_API_KEY || '';
    this.apiUrl = 'https://api.etherscan.io/api';
  }

  async getTransactionHistory(address: string): Promise<Transaction[]> {
    if (!this.isValidAddress(address)) {
      return [];
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        return response.data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: parseInt(tx.timeStamp)
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async getContractInfo(address: string) {
    try {
      const response = await axios.get(`${this.apiUrl}`, {
        params: {
          module: 'contract',
          action: 'getabi',
          address,
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1' && response.data.result) {
        return { verified: true };
      }

      return { verified: false };
    } catch (error) {
      console.error('Failed to fetch contract info:', error);
      return { verified: false };
    }
  }
}
