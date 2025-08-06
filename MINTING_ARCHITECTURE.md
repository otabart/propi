# 🏠 Propius NFT Minting & Fractional Distribution Architecture

## 🎯 Core Architecture Decision

We're implementing a **Two-Stage Tokenization System** with compliance built-in:

### Stage 1: Property NFT (Whole Property)
- **1 Property = 1 NFT** (ERC-721)
- Minted to **property owner's wallet**
- Represents complete legal ownership
- Can exist independently or be fractionalized

### Stage 2: Fractional Shares (Optional)
- **1 Property NFT = N Fractional Tokens** (ERC-1155)
- Property owner decides fractionalization parameters
- Shares distributed through compliant mechanisms

---

## 🔧 Minting Flow Options

### Option A: Direct Owner Minting (Recommended)
```javascript
// Property owner specifies parameters
const mintingParams = {
  // Required by owner
  registryNumber: "RGP-2025-001",
  municipality: "Guatemala City", 
  zone: "10",
  areaSqMeters: 500,
  valuationUSD: 250000,
  
  // Fractionalization (optional)
  fractionalizeImmediately: true,
  totalShares: 1000,          // User decides: 100, 1000, 10000 shares
  sharePriceUSD: 250,         // $250 per share
  minimumInvestment: 10,      // Min 10 shares ($2,500)
  revenueGenerating: true     // Will distribute rental income
};
```

### Option B: Master Wallet + Distribution (Enterprise)
```javascript
// For large developers/enterprises
const enterpriseFlow = {
  // 1. Mint to company treasury
  masterWallet: "0xCompanyTreasury",
  
  // 2. Batch distribute to investors
  distribution: [
    { investor: "0xInvestor1", shares: 100 },
    { investor: "0xInvestor2", shares: 200 },
    // ...
  ],
  
  // 3. Compliance checks on each transfer
  kycRequired: true,
  accreditationRequired: false // For smaller amounts
};
```

---

## 📋 Implementation Details

### 1. Property Owner Flow
```solidity
// contracts/PropertyRegistry.sol - Enhanced

function tokenizePropertyWithFractionalization(
    // Basic property data
    string memory _registryNumber,
    string memory _municipality,
    // ... other property params
    
    // Fractionalization params (optional)
    bool _fractionalizeImmediately,
    uint256 _totalShares,
    uint256 _sharePriceUSD,
    uint256 _minimumInvestment
) external onlyRole(NOTARY_ROLE) returns (uint256 propertyTokenId, uint256 fractionalAssetId) {
    
    // 1. Mint property NFT to owner
    propertyTokenId = _mintPropertyNFT(...);
    
    // 2. If requested, immediately fractionalize
    if (_fractionalizeImmediately) {
        fractionalAssetId = _fractionalizeProperty(
            propertyTokenId,
            _totalShares,
            _sharePriceUSD,
            _minimumInvestment
        );
    }
    
    return (propertyTokenId, fractionalAssetId);
}
```

### 2. User Interface Flow
```javascript
// Frontend: Property Tokenization Form

const TokenizationForm = () => {
  const [propertyData, setPropertyData] = useState({
    // Property basics (required)
    registryNumber: '',
    municipality: '',
    zone: '',
    areaSqMeters: 0,
    valuationUSD: 0,
    
    // Fractionalization (optional)
    enableFractionalization: false,
    fractionalParams: {
      totalShares: 1000,      // Default suggestions
      sharePriceUSD: 0,       // Auto-calculated from valuation
      minimumInvestment: 10,
      revenueGenerating: true
    }
  });

  // Auto-calculate share price
  useEffect(() => {
    if (propertyData.valuationUSD && propertyData.fractionalParams.totalShares) {
      const pricePerShare = propertyData.valuationUSD / propertyData.fractionalParams.totalShares;
      setPropertyData(prev => ({
        ...prev,
        fractionalParams: {
          ...prev.fractionalParams,
          sharePriceUSD: pricePerShare
        }
      }));
    }
  }, [propertyData.valuationUSD, propertyData.fractionalParams.totalShares]);

  return (
    <form>
      {/* Property Details */}
      <PropertyDetailsSection />
      
      {/* Fractionalization Toggle */}
      <div className="fractionalization-section">
        <label>
          <input 
            type="checkbox" 
            checked={propertyData.enableFractionalization}
            onChange={(e) => setPropertyData(prev => ({
              ...prev, 
              enableFractionalization: e.target.checked
            }))}
          />
          Enable Fractional Investment
        </label>
        
        {propertyData.enableFractionalization && (
          <FractionalizationParams 
            params={propertyData.fractionalParams}
            onChange={setFractionalParams}
          />
        )}
      </div>
    </form>
  );
};
```

### 3. Fractionalization Parameters UI
```javascript
const FractionalizationParams = ({ params, onChange }) => {
  // Preset options for different property values
  const presets = {
    affordable: { totalShares: 100, minInvestment: 5 },   // $2,500 property → $25/share
    standard: { totalShares: 1000, minInvestment: 10 },   // $250,000 property → $250/share  
    luxury: { totalShares: 10000, minInvestment: 20 },    // $2.5M property → $250/share
    custom: { totalShares: params.totalShares, minInvestment: params.minimumInvestment }
  };

  return (
    <div className="fractionalization-config">
      <h4>Investment Configuration</h4>
      
      {/* Preset Buttons */}
      <div className="presets">
        {Object.entries(presets).map(([key, preset]) => (
          <button 
            key={key}
            onClick={() => onChange({
              ...params,
              totalShares: preset.totalShares,
              minimumInvestment: preset.minInvestment
            })}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Custom Parameters */}
      <div className="custom-params">
        <label>
          Total Shares:
          <input 
            type="number" 
            value={params.totalShares}
            onChange={(e) => onChange({
              ...params, 
              totalShares: parseInt(e.target.value)
            })}
          />
        </label>
        
        <label>
          Minimum Investment (shares):
          <input 
            type="number" 
            value={params.minimumInvestment}
            onChange={(e) => onChange({
              ...params, 
              minimumInvestment: parseInt(e.target.value)
            })}
          />
        </label>
        
        <div className="calculated-values">
          <p>Price per share: ${(valuationUSD / params.totalShares).toFixed(2)}</p>
          <p>Minimum investment: ${((valuationUSD / params.totalShares) * params.minimumInvestment).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🛡️ Compliance Rails

### 1. KYC/AML Integration
```javascript
// Before any fractional purchase
const complianceCheck = async (investor, investmentAmount) => {
  // Tier 1: Basic KYC (under $5,000)
  if (investmentAmount < 5000) {
    return await basicKYC(investor);
  }
  
  // Tier 2: Enhanced KYC ($5,000 - $50,000)  
  if (investmentAmount < 50000) {
    return await enhancedKYC(investor);
  }
  
  // Tier 3: Accredited investor verification (over $50,000)
  return await accreditedInvestorCheck(investor);
};
```

### 2. Smart Contract Compliance
```solidity
// contracts/FractionalProperty.sol - Enhanced

mapping(address => bool) public kycVerified;
mapping(address => uint8) public investorTier; // 1=Basic, 2=Enhanced, 3=Accredited

modifier requiresKYC(uint256 investmentAmount) {
    require(kycVerified[msg.sender], "KYC required");
    
    if (investmentAmount >= 50000 * 1e6) { // $50K in 6 decimals
        require(investorTier[msg.sender] >= 3, "Accredited investor required");
    } else if (investmentAmount >= 5000 * 1e6) { // $5K in 6 decimals
        require(investorTier[msg.sender] >= 2, "Enhanced KYC required");
    }
    _;
}

function purchaseShares(uint256 _assetId, uint256 _shares) 
    external 
    requiresKYC(_shares * fractionalAssets[_assetId].sharePriceUSD) 
{
    // Purchase logic...
}
```

### 3. Distribution Mechanisms

#### A. Public Sale (Retail Investors)
```javascript
const publicSale = {
  method: "First Come First Served",
  kycRequired: true,
  minimumInvestment: 10, // shares
  maximumInvestment: 1000, // shares ($250K max per investor)
  saleDuration: "30 days",
  earlyAccess: "KYC verified users get 24h early access"
};
```

#### B. Private Placement (Accredited)
```javascript
const privatePlacement = {
  method: "Whitelist + Manual Approval",  
  accreditationRequired: true,
  minimumInvestment: 200, // shares ($50K minimum)
  maximumInvestment: "unlimited",
  saleDuration: "7 days",
  earlyAccess: "48h before public"
};
```

#### C. Employee/Family Distribution
```javascript
const employeeDistribution = {
  method: "Direct Allocation",
  recipients: ["0xEmployee1", "0xFamily1"],
  allocation: [100, 50], // shares
  vesting: "6 month cliff, 24 month linear",
  restrictions: "Cannot sell for 12 months"
};
```

---

## 💡 Recommended User Flow

### For Individual Property Owners:
1. **Upload Documents** → Arweave via Irys
2. **Property Verification** → Notary signs off
3. **Choose Tokenization Type**:
   - ✅ **Whole Property Only** (Keep as single NFT)
   - ✅ **Fractionalize for Investment** (Split into shares)
4. **Set Parameters** (if fractionalizing):
   - Total shares (100/1000/10000)
   - Minimum investment amount  
   - Revenue sharing (yes/no)
5. **Deploy & Distribute** via smart contract

### For Developers/Enterprises:
1. **Bulk Property Upload**
2. **Treasury Minting** → All NFTs to company wallet
3. **Investor Relations** → KYC collection, allocation lists
4. **Batch Distribution** → Smart contract distributes to investors
5. **Ongoing Management** → Revenue distribution, governance

---

## 🎯 User Experience Examples

### Example 1: Small Property Owner
```
Property Value: $100,000
Fractionalization: 400 shares @ $250 each
Minimum Investment: 4 shares ($1,000)
Target: Local investors, diaspora
KYC: Basic (ID + address verification)
```

### Example 2: Luxury Developer  
```
Property Value: $2,500,000
Fractionalization: 10,000 shares @ $250 each  
Minimum Investment: 20 shares ($5,000)
Target: International investors
KYC: Enhanced + Accredited investor verification
```

### Example 3: Community Property
```
Property Value: $50,000
Fractionalization: 200 shares @ $250 each
Minimum Investment: 2 shares ($500)
Target: Community members, local families
KYC: Basic (simplified for small amounts)
```

---

This system gives maximum flexibility while maintaining compliance. Property owners control the fractionalization parameters, and the smart contracts enforce all compliance requirements automatically.

Which approach feels right for your target market in Guatemala?