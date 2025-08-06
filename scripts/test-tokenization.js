const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing Property Tokenization Flow\n");

  // Load deployment info
  const deploymentPath = path.join(__dirname, "../deployments/latest.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Run 'npm run deploy:base-sepolia' first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("📋 Using deployment from:", deployment.timestamp);
  console.log("Network:", deployment.network, "(Chain ID:", deployment.chainId, ")\n");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with account:", signer.address);

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

  console.log("-----------------------------------\n");

  // Test 1: Tokenize a whole property
  console.log("📝 Test 1: Tokenizing a whole property...");
  
  const propertyData = {
    registryNumber: "RGP-2025-" + Math.floor(Math.random() * 10000),
    cadastralReference: "CAD-GT-Z10-001",
    municipality: "Guatemala City",
    zone: "10",
    areaSqMeters: 500,
    constructionSqMeters: 350,
    propertyType: 0, // Residential
    owner: signer.address,
    documentIPFSHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco", // Example IPFS hash
    valuationUSD: 250000,
    valuationGTQ: 1950000, // ~7.8 GTQ per USD
  };

  try {
    const tx = await PropertyRegistry.tokenizeProperty(
      propertyData.registryNumber,
      propertyData.cadastralReference,
      propertyData.municipality,
      propertyData.zone,
      propertyData.areaSqMeters,
      propertyData.constructionSqMeters,
      propertyData.propertyType,
      propertyData.owner,
      propertyData.documentIPFSHash,
      propertyData.valuationUSD,
      propertyData.valuationGTQ
    );

    console.log("⏳ Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Property tokenized! Gas used:", receipt.gasUsed.toString());

    // Get the token ID from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = PropertyRegistry.interface.parseLog(log);
        return parsed.name === "PropertyTokenized";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = PropertyRegistry.interface.parseLog(event);
      const tokenId = parsedEvent.args[0];
      console.log("🏠 Property NFT Token ID:", tokenId.toString());
      console.log("📄 Registry Number:", propertyData.registryNumber);
      console.log("💰 Valuation: $", propertyData.valuationUSD.toLocaleString());

      // Test 2: Fractionalize the property
      console.log("\n📝 Test 2: Fractionalizing the property...");

      const fractionalData = {
        propertyTokenId: tokenId,
        propertyRegistry: deployment.contracts.PropertyRegistry,
        propertyIdentifier: propertyData.registryNumber,
        totalShares: 1000,
        sharePriceUSD: 250000, // $250 per share (in 6 decimals: 250 * 1e6)
        minimumInvestment: 10, // Minimum 10 shares
        paymentToken: deployment.configuration.usdcAddress,
        beneficiary: signer.address,
        revenueGenerating: true,
        metadataURI: "https://api.propius.gt/metadata/" + tokenId,
      };

      const fracTx = await FractionalProperty.fractionalizeProperty(
        fractionalData.propertyTokenId,
        fractionalData.propertyRegistry,
        fractionalData.propertyIdentifier,
        fractionalData.totalShares,
        fractionalData.sharePriceUSD,
        fractionalData.minimumInvestment,
        fractionalData.paymentToken,
        fractionalData.beneficiary,
        fractionalData.revenueGenerating,
        fractionalData.metadataURI
      );

      console.log("⏳ Transaction sent:", fracTx.hash);
      const fracReceipt = await fracTx.wait();
      console.log("✅ Property fractionalized! Gas used:", fracReceipt.gasUsed.toString());

      // Get the asset ID from events
      const fracEvent = fracReceipt.logs.find(log => {
        try {
          const parsed = FractionalProperty.interface.parseLog(log);
          return parsed.name === "AssetFractionalized";
        } catch {
          return false;
        }
      });

      if (fracEvent) {
        const parsedFracEvent = FractionalProperty.interface.parseLog(fracEvent);
        const assetId = parsedFracEvent.args[0];
        console.log("🔢 Fractional Asset ID:", assetId.toString());
        console.log("📊 Total Shares:", fractionalData.totalShares);
        console.log("💵 Price per Share: $", (fractionalData.sharePriceUSD / 1e6).toFixed(2));
        console.log("📈 Total Value: $", ((fractionalData.totalShares * fractionalData.sharePriceUSD) / 1e6).toLocaleString());
      }
    }

    // Test 3: Query property details
    console.log("\n📝 Test 3: Querying property details...");
    
    const ownerProperties = await PropertyRegistry.getOwnerProperties(signer.address);
    console.log("📊 Total properties owned:", ownerProperties.length);
    
    if (ownerProperties.length > 0) {
      const latestTokenId = ownerProperties[ownerProperties.length - 1];
      const propertyDetails = await PropertyRegistry.getProperty(latestTokenId);
      
      console.log("\n🏠 Latest Property Details:");
      console.log("  Registry Number:", propertyDetails.registryNumber);
      console.log("  Municipality:", propertyDetails.municipality);
      console.log("  Zone:", propertyDetails.zone);
      console.log("  Area:", propertyDetails.areaSqMeters.toString(), "m²");
      console.log("  Construction:", propertyDetails.constructionSqMeters.toString(), "m²");
      console.log("  Valuation (USD): $", propertyDetails.valuationUSD.toString());
      console.log("  Valuation (GTQ): Q", propertyDetails.valuationGTQ.toString());
      console.log("  Is Verified:", propertyDetails.isVerified);
      console.log("  Has Encumbrance:", propertyDetails.hasEncumbrance);
    }

    console.log("\n✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Error during testing:", error.message);
    if (error.data) {
      const decodedError = PropertyRegistry.interface.parseError(error.data);
      if (decodedError) {
        console.error("Contract error:", decodedError);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });