import { ModelTrainer } from '../src/ml/training/trainModel';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
  const rpcUrl = process.env.ETH_RPC_URL;

  if (!etherscanApiKey || !rpcUrl) {
    console.error('Lütfen .env dosyasında ETHERSCAN_API_KEY ve ETH_RPC_URL değerlerini tanımlayın');
    process.exit(1);
  }

  const trainer = new ModelTrainer(etherscanApiKey, rpcUrl);

  try {
    console.log('Model eğitimi başlatılıyor...');
    await trainer.trainModel();
    console.log('Model eğitimi başarıyla tamamlandı!');
  } catch (error) {
    console.error('Model eğitimi sırasında hata oluştu:', error);
    process.exit(1);
  }
}

main(); 