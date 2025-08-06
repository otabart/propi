# Propius Testing Guide

## 🚀 Quick Start Commands

### Installation
```bash
# Install all dependencies
npm install
```

### Local Testing
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy to local node
npm run deploy:local

# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Base Sepolia Deployment
```bash
# Deploy to Base Sepolia testnet
npm run deploy:base-sepolia

# Test the deployed contracts
node scripts/test-tokenization.js
```

## 📋 Step-by-Step Testing Guide

### 1. Install Dependencies
```bash
cd /Volumes/WORKHORSE\ GS/vibecoding/propius
npm install
```

### 2. Compile Smart Contracts
```bash
npm run compile
```
This will compile all contracts and generate artifacts in the `artifacts/` folder.

### 3. Run Local Tests
```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/PropertyRegistry.test.js

# Run with gas reporting
REPORT_GAS=true npm run test
```

### 4. Start Local Blockchain
```bash
# Terminal 1: Start Hardhat node
npm run node
```
This starts a local blockchain on `http://127.0.0.1:8545`

### 5. Deploy Locally
```bash
# Terminal 2: Deploy contracts
npm run deploy:local
```

### 6. Deploy to Base Sepolia
```bash
# Make sure you have Base Sepolia ETH
# Your wallet: 0x5E6A7072d4e71CA37798eeE11FD9bac9990c4D13
# Get test ETH from: https://www.alchemy.com/faucets/base-sepolia

# Deploy contracts
npm run deploy:base-sepolia
```

### 7. Test Deployed Contracts
```bash
# Run the test tokenization script
node scripts/test-tokenization.js
```

## 🔧 Configuration Details

### Your Wallet Info
- **Address**: `0x5E6A7072d4e71CA37798eeE11FD9bac9990c4D13`
- **Private Key**: Already configured in `.env`

### Network Details
- **Base Sepolia RPC**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Block Explorer**: `https://sepolia.basescan.org`
- **USDC on Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Getting Test Tokens
1. **Base Sepolia ETH**: https://www.alchemy.com/faucets/base-sepolia
2. **USDC Test Tokens**: Use the Base Sepolia bridge or mint from a faucet

## 📝 Contract Interaction Examples

### Using Hardhat Console
```bash
# Start console connected to Base Sepolia
npx hardhat console --network baseSepolia

# In console:
const Registry = await ethers.getContractAt("PropertyRegistry", "DEPLOYED_ADDRESS");
const properties = await Registry.getOwnerProperties("0x5E6A7072d4e71CA37798eeE11FD9bac9990c4D13");
console.log(properties);
```

### Direct Script Execution
```javascript
// Create a new file: scripts/interact.js
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Load deployed contract
  const deployment = require("../deployments/latest.json");
  const Registry = await hre.ethers.getContractAt(
    "PropertyRegistry",
    deployment.contracts.PropertyRegistry
  );
  
  // Query properties
  const balance = await Registry.balanceOf(signer.address);
  console.log("Properties owned:", balance.toString());
}

main().catch(console.error);
```

## 🧪 Test Scenarios

### Scenario 1: Tokenize a Property
```javascript
// Already implemented in test-tokenization.js
// Creates an NFT representing a whole property
```

### Scenario 2: Fractionalize Property
```javascript
// Splits property into 1000 shares
// Sets minimum investment of 10 shares
// Enables revenue distribution
```

### Scenario 3: Property Transfer
```javascript
// Request transfer to new owner
// Requires notary approval
// Requires registry approval
// Completes transfer automatically
```

## 📊 Gas Costs (Estimated)

| Operation | Gas Used | Cost (at 1 gwei) |
|-----------|----------|------------------|
| Deploy PropertyRegistry | ~3,500,000 | ~0.0035 ETH |
| Deploy FractionalProperty | ~4,000,000 | ~0.004 ETH |
| Deploy PropertyEscrow | ~2,500,000 | ~0.0025 ETH |
| Tokenize Property | ~350,000 | ~0.00035 ETH |
| Fractionalize Property | ~250,000 | ~0.00025 ETH |
| Transfer Property | ~150,000 | ~0.00015 ETH |

## 🔍 Viewing Transactions

After deployment or testing, view your transactions:
1. Go to https://sepolia.basescan.org
2. Search for your address: `0x5E6A7072d4e71CA37798eeE11FD9bac9990c4D13`
3. View contract deployments and interactions

## 🐛 Troubleshooting

### "Insufficient funds"
```bash
# Check balance
npx hardhat run scripts/check-balance.js --network baseSepolia

# Get more test ETH from faucet
```

### "Nonce too high"
```bash
# Reset nonce in MetaMask or use:
npx hardhat clean
```

### "Contract not verified"
```bash
# Manually verify on Basescan
npx hardhat verify --network baseSepolia DEPLOYED_ADDRESS "CONSTRUCTOR_ARGS"
```

## 📚 Additional Resources

- **Base Docs**: https://docs.base.org
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/5.x/
- **Base Sepolia Faucet**: https://www.alchemy.com/faucets/base-sepolia

## 🎯 Next Steps

1. **Get Base Sepolia ETH** from the faucet
2. **Run `npm install`** to install dependencies
3. **Run `npm run compile`** to compile contracts
4. **Run `npm run test`** to ensure everything works
5. **Deploy with `npm run deploy:base-sepolia`**
6. **Test with `node scripts/test-tokenization.js`**

Your contracts are ready to deploy! The total deployment cost should be less than 0.01 ETH on Base Sepolia.