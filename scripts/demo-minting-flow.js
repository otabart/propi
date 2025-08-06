const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { 
  uploadPropertyDocumentBundle,
  generatePropertyMetadata 
} = require('../utils/propertyDocumentUploader');

/**
 * Demo: Complete Property Minting & Fractionalization Flow
 * Shows different user scenarios for Guatemala properties
 */

async function demonstrateMintingFlows() {
  console.log("🏠 Propius Minting Flow Demonstration\n");

  // Load deployment info
  const deploymentPath = path.join(__dirname, "../deployments/latest.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Run 'npm run deploy:base-sepolia' first.");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const [signer] = await hre.ethers.getSigners();

  // Get contract instances
  const PropertyRegistry = await hre.ethers.getContractAt(
    "PropertyRegistry",
    deployment.contracts.PropertyRegistry,
    signer
  );

  const FractionalProperty = await hre.ethers.getContractAt(
    "FractionalProperty", 
    deployment.contracts.FractionalProperty,
    signer
  );

  console.log("📋 Testing different minting scenarios...\n");

  // ========================
  // SCENARIO 1: Small Property Owner
  // ========================
  console.log("🏘️ SCENARIO 1: Small Property Owner (Residential)");
  console.log("---------------------------------------------------");
  
  const scenario1 = {
    propertyData: {
      registryNumber: "RGP-2025-DEMO-001",
      cadastralReference: "CAD-GT-Z15-001", 
      municipality: "Guatemala City",
      zone: "15",
      areaSqMeters: 150,
      constructionSqMeters: 120,
      propertyType: 0, // Residential
      valuationUSD: 75000,
      valuationGTQ: 585000
    },
    fractionalization: {
      enabled: true,
      totalShares: 300,        // $250 per share
      minimumInvestment: 4,    // $1,000 minimum
      revenueGenerating: true  // Rental income
    },
    targetMarket: "Local families, diaspora remittances"
  };

  await demonstrateScenario("Small Property Owner", scenario1, PropertyRegistry, FractionalProperty, signer);

  // ========================
  // SCENARIO 2: Luxury Developer
  // ========================
  console.log("\n🏢 SCENARIO 2: Luxury Developer (Commercial)");
  console.log("----------------------------------------------");
  
  const scenario2 = {
    propertyData: {
      registryNumber: "RGP-2025-DEMO-002",
      cadastralReference: "CAD-GT-Z10-002",
      municipality: "Guatemala City", 
      zone: "10",
      areaSqMeters: 2000,
      constructionSqMeters: 1800,
      propertyType: 1, // Commercial
      valuationUSD: 2500000,
      valuationGTQ: 19500000
    },
    fractionalization: {
      enabled: true,
      totalShares: 10000,      // $250 per share
      minimumInvestment: 40,   // $10,000 minimum
      revenueGenerating: true  // Commercial rent
    },
    targetMarket: "International investors, institutions"
  };

  await demonstrateScenario("Luxury Developer", scenario2, PropertyRegistry, FractionalProperty, signer);

  // ========================
  // SCENARIO 3: Community Property
  // ========================
  console.log("\n🏘️ SCENARIO 3: Community Property (Agricultural)");
  console.log("--------------------------------------------------");
  
  const scenario3 = {
    propertyData: {
      registryNumber: "RGP-2025-DEMO-003",
      cadastralReference: "CAD-GT-PETEN-001",
      municipality: "Peten", 
      zone: "Rural",
      areaSqMeters: 50000,
      constructionSqMeters: 0,
      propertyType: 3, // Agricultural
      valuationUSD: 125000,
      valuationGTQ: 975000
    },
    fractionalization: {
      enabled: true,
      totalShares: 500,        // $250 per share
      minimumInvestment: 2,    // $500 minimum
      revenueGenerating: true  // Agricultural yields
    },
    targetMarket: "Community members, agricultural investors"
  };

  await demonstrateScenario("Community Property", scenario3, PropertyRegistry, FractionalProperty, signer);

  // ========================
  // SCENARIO 4: Whole Property Only
  // ========================
  console.log("\n🏠 SCENARIO 4: Whole Property Only (No Fractionalization)");
  console.log("---------------------------------------------------------");
  
  const scenario4 = {
    propertyData: {
      registryNumber: "RGP-2025-DEMO-004",
      cadastralReference: "CAD-GT-Z14-004",
      municipality: "Guatemala City",
      zone: "14", 
      areaSqMeters: 800,
      constructionSqMeters: 600,
      propertyType: 0, // Residential
      valuationUSD: 450000,
      valuationGTQ: 3510000
    },
    fractionalization: {
      enabled: false
    },
    targetMarket: "Single wealthy buyer, family trust"
  };

  await demonstrateScenario("Whole Property Only", scenario4, PropertyRegistry, FractionalProperty, signer);

  console.log("\n🎉 All minting scenarios demonstrated!");
  console.log("\n📊 Summary:");
  console.log("- Scenario 1: $75K property → 300 shares @ $250 each");
  console.log("- Scenario 2: $2.5M property → 10,000 shares @ $250 each");  
  console.log("- Scenario 3: $125K property → 500 shares @ $250 each");
  console.log("- Scenario 4: $450K property → Single NFT (no fractionalization)");
}

async function demonstrateScenario(name, scenario, PropertyRegistry, FractionalProperty, signer) {
  try {
    console.log(`\n📝 ${name} Configuration:`);
    console.log(`   Property Value: $${scenario.propertyData.valuationUSD.toLocaleString()}`);
    console.log(`   Location: ${scenario.propertyData.municipality}, Zone ${scenario.propertyData.zone}`);
    console.log(`   Area: ${scenario.propertyData.areaSqMeters}m²`);
    console.log(`   Target Market: ${scenario.targetMarket}`);

    if (scenario.fractionalization.enabled) {
      const sharePrice = scenario.propertyData.valuationUSD / scenario.fractionalization.totalShares;
      const minInvestment = sharePrice * scenario.fractionalization.minimumInvestment;
      
      console.log(`\n💰 Fractionalization:`);
      console.log(`   Total Shares: ${scenario.fractionalization.totalShares.toLocaleString()}`);
      console.log(`   Price per Share: $${sharePrice.toFixed(2)}`);
      console.log(`   Minimum Investment: ${scenario.fractionalization.minimumInvestment} shares ($${minInvestment.toFixed(2)})`);
    } else {
      console.log(`\n💰 Single NFT: No fractionalization`);
    }

    // 1. Tokenize Property
    console.log(`\n🔄 Step 1: Tokenizing property...`);
    
    const tx1 = await PropertyRegistry.tokenizeProperty(
      scenario.propertyData.registryNumber,
      scenario.propertyData.cadastralReference,
      scenario.propertyData.municipality,
      scenario.propertyData.zone,
      scenario.propertyData.areaSqMeters,
      scenario.propertyData.constructionSqMeters,
      scenario.propertyData.propertyType,
      signer.address,
      "QmPropertyDoc" + Date.now(), // Mock IPFS hash
      scenario.propertyData.valuationUSD,
      scenario.propertyData.valuationGTQ
    );

    console.log(`   ⏳ Transaction: ${tx1.hash}`);
    const receipt1 = await tx1.wait();
    console.log(`   ✅ Property tokenized! Gas used: ${receipt1.gasUsed.toString()}`);

    // Get token ID from event
    const tokenizeEvent = receipt1.logs.find(log => {
      try {
        const parsed = PropertyRegistry.interface.parseLog(log);
        return parsed.name === "PropertyTokenized";
      } catch { return false; }
    });

    if (tokenizeEvent) {
      const parsedEvent = PropertyRegistry.interface.parseLog(tokenizeEvent);
      const tokenId = parsedEvent.args[0];
      console.log(`   🏠 Property NFT ID: ${tokenId.toString()}`);

      // 2. Fractionalize if enabled
      if (scenario.fractionalization.enabled) {
        console.log(`\n🔄 Step 2: Fractionalizing property...`);
        
        const sharePriceWith6Decimals = Math.floor(
          (scenario.propertyData.valuationUSD / scenario.fractionalization.totalShares) * 1e6
        );
        
        const tx2 = await FractionalProperty.fractionalizeProperty(
          tokenId,
          PropertyRegistry.target,
          scenario.propertyData.registryNumber,
          scenario.fractionalization.totalShares,
          sharePriceWith6Decimals,
          scenario.fractionalization.minimumInvestment,
          "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC Base Sepolia
          signer.address,
          scenario.fractionalization.revenueGenerating,
          `https://api.propius.gt/metadata/${tokenId}`
        );

        console.log(`   ⏳ Transaction: ${tx2.hash}`);
        const receipt2 = await tx2.wait();
        console.log(`   ✅ Property fractionalized! Gas used: ${receipt2.gasUsed.toString()}`);

        // Get asset ID from event  
        const fracEvent = receipt2.logs.find(log => {
          try {
            const parsed = FractionalProperty.interface.parseLog(log);
            return parsed.name === "AssetFractionalized";
          } catch { return false; }
        });

        if (fracEvent) {
          const parsedFracEvent = FractionalProperty.interface.parseLog(fracEvent);
          const assetId = parsedFracEvent.args[0];
          console.log(`   🔢 Fractional Asset ID: ${assetId.toString()}`);
          console.log(`   📊 Available for investment: ${scenario.fractionalization.totalShares} shares`);
          
          // Show investment tiers
          const sharePrice = scenario.propertyData.valuationUSD / scenario.fractionalization.totalShares;
          console.log(`\n📈 Investment Tiers:`);
          console.log(`   Retail (4-20 shares): $${(sharePrice * 4).toFixed(0)} - $${(sharePrice * 20).toFixed(0)}`);
          console.log(`   Moderate (21-100 shares): $${(sharePrice * 21).toFixed(0)} - $${(sharePrice * 100).toFixed(0)}`);
          console.log(`   Large (100+ shares): $${(sharePrice * 100).toFixed(0)}+`);
        }
      }
    }

    console.log(`   ✅ ${name} scenario complete!\n`);

  } catch (error) {
    console.error(`❌ Error in ${name} scenario:`, error.message);
  }
}

// Function to show KYC requirements for different investment levels
function showComplianceRequirements() {
  console.log("\n🛡️ KYC/COMPLIANCE REQUIREMENTS");
  console.log("================================");
  console.log("🟢 Tier 1 ($500 - $5,000):");
  console.log("   - Basic ID verification");
  console.log("   - Address confirmation");
  console.log("   - Phone/email verification");
  
  console.log("\n🟡 Tier 2 ($5,000 - $50,000):");
  console.log("   - Enhanced KYC");
  console.log("   - Income verification");
  console.log("   - Source of funds documentation");
  
  console.log("\n🔴 Tier 3 ($50,000+):");
  console.log("   - Accredited investor verification");
  console.log("   - Net worth documentation");
  console.log("   - Professional investor status");
  console.log("   - Legal entity verification (if applicable)");
}

if (require.main === module) {
  demonstrateMintingFlows()
    .then(() => {
      showComplianceRequirements();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { demonstrateMintingFlows };