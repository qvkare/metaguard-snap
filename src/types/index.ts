export interface Transaction {
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce?: string;
  gas?: string;
  gasPrice?: string;
  estimateSuggested?: string;
  estimateUsed?: string;
} 