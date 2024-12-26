import { TransactionRequest } from '@metamask/snaps-sdk';
import { MLModel } from './mlModel';
import dotenv from 'dotenv';

dotenv.config();

export interface TransactionFeatures {
  value: string;
  gasPrice: string;
  gasLimit: string;
  contractAddress: string;
  methodSignature: string;
  inputData: string;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
}

export class TransactionAnalysisModel {
  private mlModel: MLModel;
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.MODEL_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.mlModel = new MLModel(this.encryptionKey);
    this.initializeModel();
  }

  private generateEncryptionKey(): string {
    // Rastgele bir şifreleme anahtarı oluştur
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private async initializeModel() {
    try {
      // Kayıtlı modeli yükle
      await this.mlModel.loadModel(process.env.MODEL_SAVE_PATH || './models/transaction_model');
    } catch (error) {
      console.log('Kayıtlı model bulunamadı, yeni model oluşturuluyor...');
    }
  }

  public async analyzeTransaction(transaction: TransactionRequest): Promise<RiskAssessment> {
    const features = this.extractFeatures(transaction);
    const mlScore = await this.mlModel.predict(features);
    return this.assessRisk(features, mlScore);
  }

  private extractFeatures(transaction: TransactionRequest): TransactionFeatures {
    return {
      value: transaction.value?.toString() || '0',
      gasPrice: transaction.gasPrice?.toString() || '0',
      gasLimit: transaction.gas?.toString() || '0',
      contractAddress: transaction.to || '',
      methodSignature: this.extractMethodSignature(transaction.data?.toString() || ''),
      inputData: transaction.data?.toString() || '',
    };
  }

  private extractMethodSignature(data: string): string {
    return data.length >= 10 ? data.slice(0, 10) : '';
  }

  private async assessRisk(features: TransactionFeatures, mlScore: number): Promise<RiskAssessment> {
    const riskFactors: string[] = [];
    let riskScore = mlScore * 100;

    const valueInEther = parseInt(features.value) / 1e18;
    if (valueInEther > 10) {
      riskFactors.push('Yüksek değerli işlem');
      riskScore = Math.min(100, riskScore + 10);
    }

    if (!this.isKnownMethodSignature(features.methodSignature)) {
      riskFactors.push('Bilinmeyen method imzası');
      riskScore = Math.min(100, riskScore + 15);
    }

    const gasPrice = parseInt(features.gasPrice);
    if (gasPrice > 100e9) {
      riskFactors.push('Yüksek gas fiyatı');
      riskScore = Math.min(100, riskScore + 5);
    }

    if (features.inputData.length > 10) {
      riskFactors.push('Akıllı kontrat etkileşimi');
      riskScore = Math.min(100, riskScore + 10);
    }

    return {
      riskScore,
      riskLevel: this.calculateRiskLevel(riskScore),
      riskFactors,
    };
  }

  private isKnownMethodSignature(signature: string): boolean {
    const knownSignatures = [
      '0xa9059cbb', // transfer
      '0x095ea7b3', // approve
      '0x23b872dd', // transferFrom
      '0x70a08231', // balanceOf
      '0x18160ddd', // totalSupply
      '0xdd62ed3e', // allowance
    ];
    return knownSignatures.includes(signature);
  }

  private calculateRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  public async trainModel(trainingData: { features: TransactionFeatures; label: number }[]) {
    const features = trainingData.map(data => data.features);
    const labels = trainingData.map(data => data.label);
    
    await this.mlModel.trainModel(features, labels);
    
    // Eğitilen modeli şifreli olarak kaydet
    await this.mlModel.saveModel(process.env.MODEL_SAVE_PATH || './models/transaction_model');
  }
} 