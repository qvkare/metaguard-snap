import { HttpClient } from '../../utils/httpClient';

interface ContractInfo {
  verified: boolean;
  name: string;
}

export class EtherscanService {
  private readonly httpClient: HttpClient;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.etherscan.io/api';

  constructor(httpClient?: HttpClient, apiKey?: string) {
    this.httpClient = httpClient || new HttpClient();
    this.apiKey = apiKey || process.env.ETHERSCAN_API_KEY || '';
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}?module=contract&action=getabi&address=${address}&apikey=${this.apiKey}`
      );

      return {
        verified: response.data.status === '1',
        name: response.data.result?.ContractName || 'Unknown Contract'
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return {
        verified: false,
        name: 'Unknown Contract'
      };
    }
  }
} 