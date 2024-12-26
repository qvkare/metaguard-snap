import { TransactionAnalysisModel, TransactionFeatures } from '../models/transactionModel';
import { ethers } from 'ethers';
import axios from 'axios';

interface TrainingData {
  features: TransactionFeatures;
  label: number; // 0: güvenli, 1: riskli
}

export class ModelTrainer {
  private model: TransactionAnalysisModel;
  private provider: ethers.JsonRpcProvider;
  private etherscanApiKey: string;

  constructor(etherscanApiKey: string, rpcUrl: string) {
    this.model = new TransactionAnalysisModel();
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.etherscanApiKey = etherscanApiKey;
  }

  public async collectTrainingData(blockCount: number = 100): Promise<TrainingData[]> {
    const trainingData: TrainingData[] = [];
    const currentBlock = await this.provider.getBlockNumber();

    for (let i = 0; i < blockCount; i++) {
      const block = await this.provider.getBlock(currentBlock - i, true);
      if (!block) continue;

      for (const tx of block.transactions) {
        if (typeof tx === 'string') continue;

        const features = await this.extractFeatures(tx);
        const label = await this.determineLabel(tx);

        trainingData.push({
          features,
          label,
        });
      }
    }

    return trainingData;
  }

  private async extractFeatures(tx: ethers.TransactionResponse): Promise<TransactionFeatures> {
    return {
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasLimit: tx.gasLimit.toString(),
      contractAddress: tx.to || '',
      methodSignature: tx.data.slice(0, 10),
      inputData: tx.data,
    };
  }

  private async determineLabel(tx: ethers.TransactionResponse): Promise<number> {
    // Etiketleme kriterleri
    let riskScore = 0;

    // 1. Kontrat güvenlik kontrolü
    if (tx.to) {
      const contractSecurity = await this.checkContractSecurity(tx.to);
      riskScore += contractSecurity * 0.4; // 40% ağırlık
    }

    // 2. İşlem değeri kontrolü
    const valueInEther = parseFloat(ethers.formatEther(tx.value));
    if (valueInEther > 10) {
      riskScore += 0.3; // 30% ağırlık
    }

    // 3. Gas fiyatı kontrolü
    const gasPriceGwei = parseFloat(ethers.formatUnits(tx.gasPrice || 0, 'gwei'));
    if (gasPriceGwei > 100) {
      riskScore += 0.15; // 15% ağırlık
    }

    // 4. Kontrat etkileşimi kontrolü
    if (tx.data.length > 10) {
      riskScore += 0.15; // 15% ağırlık
    }

    // 0.5'ten büyük risk skoru olan işlemler riskli olarak etiketlenir
    return riskScore > 0.5 ? 1 : 0;
  }

  private async checkContractSecurity(address: string): Promise<number> {
    try {
      // Etherscan API'den kontrat bilgilerini al
      const response = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: address,
          apikey: this.etherscanApiKey,
        },
      });

      if (response.data.status === '1' && response.data.result[0]) {
        const contract = response.data.result[0];
        let securityScore = 0;

        // Kontrat doğrulanmış mı?
        if (contract.IsContract === '1') securityScore += 0.3;
        
        // Kaynak kodu mevcut mu?
        if (contract.SourceCode.length > 0) securityScore += 0.3;
        
        // Lisans bilgisi var mı?
        if (contract.License !== 'None') securityScore += 0.2;
        
        // Optimizer kullanılmış mı?
        if (contract.OptimizationUsed === '1') securityScore += 0.2;

        return 1 - securityScore; // Risk skoru olarak döndür
      }
    } catch (error) {
      console.error('Contract security check failed:', error);
    }

    return 0.8; // Hata durumunda yüksek risk skoru döndür
  }

  public async trainModel() {
    console.log('Eğitim verisi toplaniyor...');
    const trainingData = await this.collectTrainingData();
    
    console.log(`Toplam ${trainingData.length} işlem toplandı`);
    console.log('Model eğitimi başlıyor...');
    
    await this.model.trainModel(trainingData);
    
    console.log('Model eğitimi tamamlandı');
  }
} 