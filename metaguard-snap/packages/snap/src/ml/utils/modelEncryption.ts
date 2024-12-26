import CryptoJS from 'crypto-js';
import * as tf from '@tensorflow/tfjs';

export class ModelEncryption {
  private readonly encryptionKey: string;

  constructor(key: string) {
    this.encryptionKey = key;
  }

  // Model ağırlıklarını şifrele
  public async encryptModel(model: tf.LayersModel): Promise<string> {
    const weights = await this.getModelWeights(model);
    const encryptedWeights = this.encrypt(JSON.stringify(weights));
    return encryptedWeights;
  }

  // Şifrelenmiş model ağırlıklarını çöz ve modele yükle
  public async decryptAndLoadModel(
    model: tf.LayersModel,
    encryptedWeights: string
  ): Promise<tf.LayersModel> {
    const decryptedWeights = this.decrypt(encryptedWeights);
    const weights = JSON.parse(decryptedWeights);
    await this.setModelWeights(model, weights);
    return model;
  }

  // Model ağırlıklarını al
  private async getModelWeights(model: tf.LayersModel): Promise<number[][][]> {
    const weights: number[][][] = [];
    for (const layer of model.layers) {
      const layerWeights = layer.getWeights();
      const layerWeightsData = await Promise.all(
        layerWeights.map(async (w) => Array.from(await w.data()))
      );
      weights.push(layerWeightsData);
    }
    return weights;
  }

  // Model ağırlıklarını ayarla
  private async setModelWeights(
    model: tf.LayersModel,
    weights: number[][][]
  ): Promise<void> {
    for (let i = 0; i < model.layers.length; i++) {
      const layer = model.layers[i];
      const layerWeights = weights[i];
      const tensorWeights = layerWeights.map((w) =>
        tf.tensor(w, layer.getWeights()[0].shape)
      );
      layer.setWeights(tensorWeights);
    }
  }

  // Veriyi şifrele
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  // Şifrelenmiş veriyi çöz
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Eğitim verilerini şifrele
  public encryptTrainingData(data: any): string {
    return this.encrypt(JSON.stringify(data));
  }

  // Şifrelenmiş eğitim verilerini çöz
  public decryptTrainingData(encryptedData: string): any {
    const decryptedData = this.decrypt(encryptedData);
    return JSON.parse(decryptedData);
  }
} 