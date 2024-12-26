import { Transaction } from '@metamask/snaps-sdk';
import * as tf from '@tensorflow/tfjs';

export interface TransactionFeatures {
  value: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  to: string | null;
  data?: string;
}

export class MLModel {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    try {
      // TODO: Load pre-trained model
      // For now, using a simple model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 64, activation: 'relu', inputShape: [5] }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  private preprocessTransaction(transaction: TransactionFeatures): number[] {
    const features = [
      // Convert value to number (normalized)
      Number(BigInt(transaction.value || '0')) / 1e18,
      
      // Convert gas fees to numbers (normalized)
      Number(BigInt(transaction.maxFeePerGas || '0')) / 1e9,
      Number(BigInt(transaction.maxPriorityFeePerGas || '0')) / 1e9,
      
      // Contract creation (boolean)
      transaction.to === null ? 1 : 0,
      
      // Data presence (boolean)
      transaction.data ? 1 : 0
    ];

    return features;
  }

  async predict(transaction: TransactionFeatures): Promise<number> {
    if (!this.model) {
      console.warn('Model not loaded, returning default prediction');
      return 0;
    }

    try {
      const features = this.preprocessTransaction(transaction);
      const tensor = tf.tensor2d([features]);
      const prediction = await this.model.predict(tensor) as tf.Tensor;
      const value = (await prediction.data())[0];
      
      tensor.dispose();
      prediction.dispose();
      
      return value;
    } catch (error) {
      console.error('Prediction error:', error);
      return 0;
    }
  }
} 