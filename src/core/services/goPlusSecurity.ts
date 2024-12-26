import axios from 'axios';

export interface GoPlusSecurityResult {
  isRisky: boolean;
  confidence: number;
  riskType?: string;
  details?: {
    isHoneypot?: boolean;
    isProxyContract?: boolean;
    hasSourceCode?: boolean;
    isOpenSource?: boolean;
    canTakeBack?: boolean;
    isMintable?: boolean;
    holderCount?: number;
    totalSupply?: string;
  };
}

export class GoPlusSecurityService {
  private readonly baseUrl = 'https://api.gopluslabs.io/api/v1';

  async checkAddress(address: string, chainId: number = 1): Promise<GoPlusSecurityResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/token_security/${chainId}`, {
        params: {
          contract_addresses: address,
        },
      });

      if (response.data?.result?.[address.toLowerCase()]) {
        const data = response.data.result[address.toLowerCase()];

        return {
          isRisky: this.calculateRiskLevel(data),
          confidence: this.calculateConfidence(data),
          riskType: this.determineRiskType(data),
          details: {
            isHoneypot: data.is_honeypot === '1',
            isProxyContract: data.is_proxy === '1',
            hasSourceCode: data.is_open_source === '1',
            isOpenSource: data.is_open_source === '1',
            canTakeBack: data.can_take_back === '1',
            isMintable: data.is_mintable === '1',
            holderCount: parseInt(data.holder_count || '0'),
            totalSupply: data.total_supply,
          },
        };
      }

      return {
        isRisky: false,
        confidence: 1.0,
        details: {},
      };
    } catch (error) {
      console.error('Error checking address with GoPlus Security:', error);
      return {
        isRisky: false,
        confidence: 0,
        riskType: 'Error checking security',
      };
    }
  }

  private calculateRiskLevel(data: Record<string, string>): boolean {
    const riskFactors = [
      data.is_honeypot === '1',
      data.is_proxy === '1' && data.is_open_source === '0',
      data.can_take_back === '1',
      data.is_mintable === '1',
      data.holder_count && parseInt(data.holder_count) < 10,
    ];

    return riskFactors.filter(Boolean).length >= 2;
  }

  private calculateConfidence(data: Record<string, string>): number {
    if (!data) return 0;

    const factors = [
      'is_honeypot',
      'is_proxy',
      'is_open_source',
      'can_take_back',
      'is_mintable',
      'holder_count',
    ];

    const availableFactors = factors.filter((f) => data[f] !== undefined).length;
    return availableFactors / factors.length;
  }

  private determineRiskType(data: Record<string, string>): string | undefined {
    if (data.is_honeypot === '1') return 'Honeypot';
    if (data.can_take_back === '1') return 'Can take back tokens';
    if (data.is_mintable === '1') return 'Mintable token';
    if (data.is_proxy === '1' && data.is_open_source === '0') return 'Hidden proxy implementation';
    return undefined;
  }
}
