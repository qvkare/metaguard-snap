import { HttpClient } from '../../utils/httpClient';

interface EtherscanResponse<T> {
  status: string;
  result: T;
}

interface SourceCodeResult {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export class EtherscanService {
  private httpClient: HttpClient;
  private apiKey: string;
  private readonly baseUrl = 'https://api.etherscan.io/api';

  constructor(httpClient?: HttpClient, apiKey?: string) {
    this.httpClient = httpClient || new HttpClient(this.baseUrl);
    this.apiKey = apiKey || process.env.ETHERSCAN_API_KEY || '';
  }

  async getContractSourceCode(address: string): Promise<string> {
    const endpoint = `?module=contract&action=getsourcecode&address=${address}&apikey=${this.apiKey}`;
    const response = await this.httpClient.get<EtherscanResponse<SourceCodeResult[]>>(endpoint);

    if (response.status === '1' && response.result[0]) {
      return response.result[0].SourceCode;
    }
    return '';
  }

  async isContractVerified(address: string): Promise<boolean> {
    const sourceCode = await this.getContractSourceCode(address);
    return sourceCode !== '';
  }

  async getContractABI(address: string): Promise<string> {
    const endpoint = `?module=contract&action=getabi&address=${address}&apikey=${this.apiKey}`;
    const response = await this.httpClient.get<EtherscanResponse<string>>(endpoint);
    return response.status === '1' ? response.result : '';
  }
}
