# 🚀 Propius Quick Start Guide

## Your Setup
- **Wallet**: `0x23de198F1520ad386565fc98AEE6abb3Ae5052BE` (✅ Already has Base Sepolia ETH)
- **Private Key**: ✅ Configured from king-gizzard project
- **Irys Integration**: ✅ Adapted from your existing project

## 🏃‍♂️ Quick Commands

### 1. Install & Setup
```bash
cd "/Volumes/WORKHORSE GS/vibecoding/propius"
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Test Locally
```bash
npm run test
```

### 4. Deploy to Base Sepolia
```bash
npm run deploy:base-sepolia
```

### 5. Test Property Document Upload
```bash
npm run test:upload
```

### 6. Test Full Tokenization Flow
```bash
npm run test:tokenization
```

## 📄 Document Upload Flow

The system automatically handles property deed documents like this:

### 1. **Document Upload to Arweave**
```javascript
// Takes your property deed JPEG/PDF and uploads to Arweave
const deedResult = await uploadPropertyDeedFromFile('./my-deed.pdf', {
  registryNumber: 'RGP-2025-001',
  municipality: 'Guatemala City',
  zone: '10',
  propertyType: 'Residential',
  ownerAddress: '0x23de198F1520ad386565fc98AEE6abb3Ae5052BE'
});

// Returns: https://gateway.irys.xyz/TRANSACTION_ID
```

### 2. **Creates NFT Metadata**
```javascript
// Automatically generates JSON metadata for the NFT
const metadata = {
  name: "Property RGP-2025-001",
  description: "Guatemala Property Token",
  image: "https://gateway.irys.xyz/IMAGE_ID",
  documents: [{
    type: "property-deed",
    url: "https://gateway.irys.xyz/DEED_ID",
    hash: "sha256_hash"
  }],
  attributes: [
    { trait_type: "Municipality", value: "Guatemala City" },
    { trait_type: "Zone", value: "10" },
    // ... more attributes
  ]
}
```

### 3. **Uploads Metadata to Arweave**
```javascript
// The metadata JSON is also stored on Arweave
// Returns: https://gateway.irys.xyz/METADATA_ID
```

### 4. **Tokenization on Blockchain**
```javascript
// Uses the metadata URI as tokenURI in the NFT
await PropertyRegistry.tokenizeProperty(
  registryNumber,
  // ... other params
  "https://gateway.irys.xyz/METADATA_ID" // This links to all documents
);
```

## 🔗 How It All Connects

1. **Property Deed JPEG** → Arweave (permanent storage)
2. **Property Images** → Arweave (permanent storage)  
3. **JSON Metadata** → Arweave (links to all files)
4. **NFT Token** → Base blockchain (points to metadata URI)
5. **Final Result**: NFT contains links to all property documents stored permanently on Arweave

## 💰 Costs

- **Document Storage**: ~0.001 ETH per property (via Irys)
- **Smart Contract Deployment**: ~0.01 ETH on Base Sepolia
- **Property Tokenization**: ~0.0003 ETH per property

## 🧪 Test Flow

The test creates:
- Sample property deed PDF
- Sample property image
- Complete metadata bundle
- NFT tokenization on blockchain

All documents are permanently stored and linked via the NFT metadata URI.

## 📱 Where to Run

Run all commands from: `/Volumes/WORKHORSE GS/vibecoding/propius`

Your wallet already has Base Sepolia ETH, so you're ready to deploy and test immediately!