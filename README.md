# MetaGuard - ML-based Transaction Security Analysis for MetaMask

MetaGuard is a Snap application that analyzes your MetaMask transactions using artificial intelligence and machine learning to detect potential security risks.

## 🚀 Features

### 🤖 ML-based Risk Analysis
- Transaction value analysis
- Gas price optimization
- Smart contract risk assessment
- Historical transaction analysis

### 🛡️ Security Controls
- Contract verification check
- Phishing detection (MetaMask, GoPlus, and Etherscan databases)
- License and optimization check
- Method signature validation

### 🔒 Advanced Security
- Encrypted ML model
- Secure data storage
- Caching and rate limiting
- Real-time updates

## 🛠️ Installation

1. Install dependencies:
```bash
yarn install
```

2. Configure .env file:
```env
# Ethereum RPC URL (example: Infura, Alchemy)
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Etherscan API Key
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Network Settings
NETWORK=mainnet # mainnet or testnet

# Model Settings
MODEL_SAVE_PATH=./models/transaction_model
TRAINING_BLOCK_COUNT=100

# Security Settings
MODEL_ENCRYPTION_KEY=your-very-long-and-secure-encryption-key-here
MODEL_DATA_DIR=./data/encrypted
```

3. Train the ML model:
```bash
yarn workspace metaguard-snap train
```

4. Build the Snap:
```bash
yarn workspace metaguard-snap build
```

5. Start development server:
```bash
yarn workspace metaguard-snap serve
```

## 📚 Usage

1. Open MetaMask and enable developer mode
2. Go to "http://localhost:8080"
3. Install MetaGuard snap
4. MetaGuard will automatically perform security analysis whenever you attempt any transaction

## 🔍 Security Analysis

MetaGuard performs the following checks for each transaction:

1. ML-based Risk Analysis
   - Transaction value check
   - Gas price optimization
   - Contract risk score
   - Anomaly detection

2. Contract Security Checks
   - Source code verification
   - License check
   - Optimizer usage
   - ABI verification

3. Phishing Protection
   - MetaMask blacklist
   - GoPlus security database
   - Etherscan blacklist
   - Honeypot detection

4. Transaction Analysis
   - Method signature check
   - Parameter validation
   - Historical transaction analysis
   - Gas optimization

## 🤝 Contributing

1. Fork this repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MetaMask Snaps team
- Etherscan API team
- GoPlus Security team
- TensorFlow.js team

## 📞 Contact

- GitHub: [github.com/yourusername/metaguard-snap](https://github.com/yourusername/metaguard-snap)
- Twitter: [@MetaGuardSnap](https://twitter.com/MetaGuardSnap)
- Email: contact@metaguard.eth
