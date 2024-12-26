import axios from 'axios';

export interface ContractInfo {
  verified: boolean;
  name?: string;
  error?: string;
}

export class EtherscanService {
  private readonly API_URL = 'https://api.etherscan.io/api';
  private readonly API_KEY = process.env.ETHERSCAN_API_KEY || '';
  private cache: Map<string, ContractInfo>;

  constructor() {
    this.cache = new Map();
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    if (!address) {
      return {
        verified: false,
        error: 'Invalid address'
      };
    }

    // Check cache first
    const cachedInfo = this.cache.get(address);
    if (cachedInfo) {
      return cachedInfo;
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
      const contractInfo: ContractInfo = {
        verified: false
      };

      if (result.status === '1' && result.result[0]) {
        const contractData = result.result[0];
        contractInfo.verified = contractData.ABI !== 'Contract source code not verified';
        contractInfo.name = contractData.ContractName || undefined;
      }

      // Cache the result
      this.cache.set(address, contractInfo);

      return contractInfo;
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return {
        verified: false,
        error: 'Failed to fetch contract info'
      };
    }
  }

  async getContractTransactions(address: string): Promise<any[]> {
    try {
      const response = await axios.get(this.API_URL, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          apikey: this.API_KEY
        }
      });

      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        return response.data.result;
      }

      return [];
    } catch (error) {
      console.error('Error fetching contract transactions:', error);
      return [];
    }
  }
} 