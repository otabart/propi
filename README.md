# Propi - Guatemala Property Tokenization Platform

The first compliant property tokenization platform for Guatemala. Invest in real estate from $500 or tokenize your property.

## Features

- 🏠 **Property Tokenization**: Transform real estate into tradeable digital tokens
- 💰 **Low Investment Minimum**: Start investing from just $500
- 🔒 **RGP Compliant**: Fully compliant with Guatemala's property registry
- 🌐 **Bilingual**: Full English/Spanish support
- 📱 **Wallet Integration**: MetaMask wallet connection
- 📊 **Real-time Data**: Dynamic property listings from MongoDB
- 🗂️ **Document Storage**: Permanent storage on Arweave
- ⚡ **Low-Cost Blockchain**: Built on Layer 2 for minimal fees

## Tech Stack

- **Frontend**: HTML, TailwindCSS, Vanilla JavaScript
- **Backend**: Node.js, Express, MongoDB
- **Blockchain**: Smart contracts (Hardhat, OpenZeppelin v5)
- **Storage**: Arweave for permanent document storage
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- MetaMask wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/0xgasc/propi.git
cd propi
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install smart contract dependencies:
```bash
cd ..
npm install
```

4. Start MongoDB:
```bash
brew services start mongodb-community
```

5. Start the backend:
```bash
cd backend
npm start
```

6. Start the website:
```bash
cd website
python3 -m http.server 8000
```

7. Open http://localhost:8000

## Project Structure

```
propi/
├── website/           # Frontend files
│   ├── index.html    # Homepage
│   ├── properties.html
│   ├── about.html
│   ├── how-it-works.html
│   ├── flow-chart.html
│   └── js/
│       ├── api.js    # API client
│       └── wallet.js # Wallet & translations
├── backend/          # Express API server
│   ├── server.js
│   └── package.json
├── contracts/        # Smart contracts
│   ├── PropertyRegistry.sol
│   └── FractionalProperty.sol
├── scripts/          # Deployment scripts
├── test/            # Smart contract tests
└── hardhat.config.js
```

## Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Set build settings:
   - Build Command: `cd backend && npm install`
   - Output Directory: `website`
3. Add environment variables:
   - `MONGODB_URI`
   - `NODE_ENV=production`

### Smart Contract Deployment

```bash
npm run deploy:sepolia
```

## Features in Detail

### Property Tokenization Flow
1. **Connect Wallet** → MetaMask integration
2. **Property Details** → Comprehensive Guatemala property form
3. **Document Upload** → Store on Arweave permanently  
4. **Notary Verification** → RGP compliance check
5. **Smart Contract** → Deploy tokens (ERC-721 or ERC-1155)
6. **Investment** → Property goes live for investors

### Supported Property Types
- Casa (House)
- Apartamento (Apartment)
- Edificio (Building)
- Oficina (Office)
- Bodega (Warehouse)
- Local Comercial (Commercial Space)
- Finca (Farm/Estate)
- Terreno (Land)
- Propiedad Industrial (Industrial Property)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Contact

For questions about Guatemala property tokenization or technical support, create an issue in this repository.

