const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Propius Platform Deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("-----------------------------------\n");

  // Deploy configuration
  const feeRecipient = process.env.PLATFORM_FEE_RECIPIENT || deployer.address;
  const usdcAddress = process.env.USDC_ADDRESS_BASE_SEPOLIA || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // 1. Deploy PropertyRegistry
  console.log("📝 Deploying PropertyRegistry...");
  const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy(feeRecipient);
  await propertyRegistry.waitForDeployment();
  const propertyRegistryAddress = await propertyRegistry.getAddress();
  console.log("✅ PropertyRegistry deployed to:", propertyRegistryAddress);

  // 2. Deploy FractionalProperty
  console.log("\n📝 Deploying FractionalProperty...");
  const FractionalProperty = await hre.ethers.getContractFactory("FractionalProperty");
  const fractionalProperty = await FractionalProperty.deploy(
    feeRecipient,
    "https://api.propius.gt/metadata/" // Base URI for metadata
  );
  await fractionalProperty.waitForDeployment();
  const fractionalPropertyAddress = await fractionalProperty.getAddress();
  console.log("✅ FractionalProperty deployed to:", fractionalPropertyAddress);

  // 3. Deploy PropertyEscrow
  console.log("\n📝 Deploying PropertyEscrow...");
  const PropertyEscrow = await hre.ethers.getContractFactory("PropertyEscrow");
  const propertyEscrow = await PropertyEscrow.deploy(feeRecipient);
  await propertyEscrow.waitForDeployment();
  const propertyEscrowAddress = await propertyEscrow.getAddress();
  console.log("✅ PropertyEscrow deployed to:", propertyEscrowAddress);

  // 4. Setup roles and permissions
  console.log("\n⚙️ Setting up roles and permissions...");

  // Grant PROPERTY_MANAGER_ROLE to deployer for FractionalProperty
  const PROPERTY_MANAGER_ROLE = await fractionalProperty.PROPERTY_MANAGER_ROLE();
  await fractionalProperty.grantRole(PROPERTY_MANAGER_ROLE, deployer.address);
  console.log("✅ Granted PROPERTY_MANAGER_ROLE to deployer");

  // Grant DISTRIBUTOR_ROLE to deployer for FractionalProperty
  const DISTRIBUTOR_ROLE = await fractionalProperty.DISTRIBUTOR_ROLE();
  await fractionalProperty.grantRole(DISTRIBUTOR_ROLE, deployer.address);
  console.log("✅ Granted DISTRIBUTOR_ROLE to deployer");

  // Grant NOTARY_ROLE to deployer for testing (in production, this would be actual notaries)
  const NOTARY_ROLE = await propertyRegistry.NOTARY_ROLE();
  await propertyRegistry.grantRole(NOTARY_ROLE, deployer.address);
  await propertyRegistry.addVerifiedNotary(deployer.address);
  console.log("✅ Added deployer as verified notary (for testing)");

  // Grant REGISTRY_ROLE to deployer for testing
  const REGISTRY_ROLE = await propertyRegistry.REGISTRY_ROLE();
  await propertyRegistry.grantRole(REGISTRY_ROLE, deployer.address);
  console.log("✅ Granted REGISTRY_ROLE to deployer");

  // Grant NOTARY_ROLE for escrow
  const ESCROW_NOTARY_ROLE = await propertyEscrow.NOTARY_ROLE();
  await propertyEscrow.grantRole(ESCROW_NOTARY_ROLE, deployer.address);
  console.log("✅ Granted NOTARY_ROLE for escrow to deployer");

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PropertyRegistry: propertyRegistryAddress,
      FractionalProperty: fractionalPropertyAddress,
      PropertyEscrow: propertyEscrowAddress,
    },
    configuration: {
      feeRecipient: feeRecipient,
      usdcAddress: usdcAddress,
    },
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `deployment-${network.chainId}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, "latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n-----------------------------------");
  console.log("📋 Deployment Summary:");
  console.log("-----------------------------------");
  console.log("PropertyRegistry:", propertyRegistryAddress);
  console.log("FractionalProperty:", fractionalPropertyAddress);
  console.log("PropertyEscrow:", propertyEscrowAddress);
  console.log("Fee Recipient:", feeRecipient);
  console.log("USDC Address:", usdcAddress);
  console.log("\n✅ Deployment complete!");
  console.log(`Deployment info saved to: deployments/${filename}`);

  // Verify contracts if not on localhost
  if (network.chainId !== 31337n && process.env.BASESCAN_API_KEY) {
    console.log("\n📝 Waiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("🔍 Verifying contracts on Basescan...");
    
    try {
      await hre.run("verify:verify", {
        address: propertyRegistryAddress,
        constructorArguments: [feeRecipient],
      });
      console.log("✅ PropertyRegistry verified");
    } catch (error) {
      console.log("❌ PropertyRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: fractionalPropertyAddress,
        constructorArguments: [feeRecipient, "https://api.propius.gt/metadata/"],
      });
      console.log("✅ FractionalProperty verified");
    } catch (error) {
      console.log("❌ FractionalProperty verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: propertyEscrowAddress,
        constructorArguments: [feeRecipient],
      });
      console.log("✅ PropertyEscrow verified");
    } catch (error) {
      console.log("❌ PropertyEscrow verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });