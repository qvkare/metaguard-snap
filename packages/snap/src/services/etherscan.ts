import axios from 'axios';

export interface ContractInfo {
  verified: boolean;
  name?: string;
  sourceCode?: string;
  compiler?: string;
  license?: string;
  optimizationUsed?: boolean;
  abi?: string;
  error?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  timestamp: string;
}

export class EtherscanService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string = process.env.ETHERSCAN_API_KEY || '', network: 'mainnet' | 'testnet' = 'mainnet') {
    this.apiKey = apiKey;
    this.baseUrl = network === 'mainnet' 
      ? 'https://api.etherscan.io/api'
      : 'https://api-goerli.etherscan.io/api';
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address,
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1' && response.data.result[0]) {
        const contractData = response.data.result[0];
        return {
          verified: contractData.ABI !== 'Contract source code not verified',
          name: contractData.ContractName || undefined,
          sourceCode: contractData.SourceCode || undefined,
          compiler: contractData.CompilerVersion || undefined,
          license: contractData.LicenseType || undefined,
          optimizationUsed: contractData.OptimizationUsed === '1',
          abi: contractData.ABI !== 'Contract source code not verified' ? contractData.ABI : undefined
        };
      }

      return {
        verified: false,
        error: 'Contract not found'
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getContractABI(address: string): Promise<string> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'contract',
          action: 'getabi',
          address,
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1') {
        return response.data.result;
      }

      throw new Error('Contract ABI not available');
    } catch (error) {
      console.error('Error fetching contract ABI:', error);
      throw error;
    }
  }

  async getContractTransactions(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999
  ): Promise<Transaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: startBlock,
          endblock: endBlock,
          sort: 'desc',
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1') {
        return response.data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          input: tx.input,
          timestamp: tx.timeStamp
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching contract transactions:', error);
      return [];
    }
  }
} 