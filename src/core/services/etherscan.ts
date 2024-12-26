import { HttpClient } from '../utils/httpClient';
import { ContractInfo, Transaction } from '../types/common';

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

interface ContractSourceCode {
  ABI: string;
  ContractName: string;
}

export class EtherscanService {
  private readonly httpClient: HttpClient;
  private readonly apiKey: string;

  constructor(
    httpClient?: HttpClient,
    apiKey?: string
  ) {
    this.apiKey = apiKey || process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
    this.httpClient = httpClient || new HttpClient('https://api.etherscan.io/api');
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    if (!address) {
      throw new Error('Address is required');
    }

    try {
      const response = await this.httpClient.get<EtherscanResponse<ContractSourceCode[]>>('', {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address,
          apikey: this.apiKey
        }
      });

      if (response.status === '1' && response.result && response.result.length > 0) {
        const contractData = response.result[0];
        const isVerified = contractData.ABI !== 'Contract source code not verified';
        
        return {
          verified: isVerified,
          name: isVerified ? contractData.ContractName : undefined
        };
      }

      return {
        verified: false
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw new Error('Failed to fetch contract information');
    }
  }
} 
} 