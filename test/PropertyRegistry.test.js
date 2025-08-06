const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PropertyRegistry", function () {
  // Fixture to deploy the contract
  async function deployPropertyRegistryFixture() {
    const [owner, notary, registry, user1, user2, feeRecipient] = await ethers.getSigners();

    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy(feeRecipient.address);
    await propertyRegistry.waitForDeployment();

    // Setup roles
    const NOTARY_ROLE = await propertyRegistry.NOTARY_ROLE();
    const REGISTRY_ROLE = await propertyRegistry.REGISTRY_ROLE();
    const ADMIN_ROLE = await propertyRegistry.ADMIN_ROLE();

    await propertyRegistry.grantRole(NOTARY_ROLE, notary.address);
    await propertyRegistry.addVerifiedNotary(notary.address);
    await propertyRegistry.grantRole(REGISTRY_ROLE, registry.address);
    await propertyRegistry.grantRole(ADMIN_ROLE, owner.address);

    return { propertyRegistry, owner, notary, registry, user1, user2, feeRecipient, NOTARY_ROLE, REGISTRY_ROLE };
  }

  describe("Deployment", function () {
    it("Should set the correct fee recipient", async function () {
      const { propertyRegistry, feeRecipient } = await loadFixture(deployPropertyRegistryFixture);
      expect(await propertyRegistry.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set correct initial fees", async function () {
      const { propertyRegistry } = await loadFixture(deployPropertyRegistryFixture);
      expect(await propertyRegistry.tokenizationFeeUSD()).to.equal(100);
      expect(await propertyRegistry.transferFeePercent()).to.equal(50);
    });
  });

  describe("Property Tokenization", function () {
    it("Should tokenize a property successfully", async function () {
      const { propertyRegistry, notary, user1 } = await loadFixture(deployPropertyRegistryFixture);

      const propertyData = {
        registryNumber: "RGP-2025-001",
        cadastralReference: "CAD-GT-Z10-001",
        municipality: "Guatemala City",
        zone: "10",
        areaSqMeters: 500,
        constructionSqMeters: 350,
        propertyType: 0, // Residential
        documentIPFSHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        valuationUSD: 250000,
        valuationGTQ: 1950000,
      };

      await expect(
        propertyRegistry.connect(notary).tokenizeProperty(
          propertyData.registryNumber,
          propertyData.cadastralReference,
          propertyData.municipality,
          propertyData.zone,
          propertyData.areaSqMeters,
          propertyData.constructionSqMeters,
          propertyData.propertyType,
          user1.address,
          propertyData.documentIPFSHash,
          propertyData.valuationUSD,
          propertyData.valuationGTQ
        )
      ).to.emit(propertyRegistry, "PropertyTokenized");

      // Check token was minted
      expect(await propertyRegistry.balanceOf(user1.address)).to.equal(1);

      // Check property details
      const tokenId = await propertyRegistry.registryNumberToTokenId(propertyData.registryNumber);
      const property = await propertyRegistry.getProperty(tokenId);
      
      expect(property.registryNumber).to.equal(propertyData.registryNumber);
      expect(property.municipality).to.equal(propertyData.municipality);
      expect(property.valuationUSD).to.equal(propertyData.valuationUSD);
      expect(property.isVerified).to.be.true;
    });

    it("Should prevent non-notaries from tokenizing", async function () {
      const { propertyRegistry, user1, user2 } = await loadFixture(deployPropertyRegistryFixture);

      await expect(
        propertyRegistry.connect(user1).tokenizeProperty(
          "RGP-2025-002",
          "CAD-GT-Z10-002",
          "Guatemala City",
          "10",
          500,
          350,
          0,
          user2.address,
          "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
          250000,
          1950000
        )
      ).to.be.reverted;
    });

    it("Should prevent duplicate tokenization", async function () {
      const { propertyRegistry, notary, user1 } = await loadFixture(deployPropertyRegistryFixture);

      const registryNumber = "RGP-2025-003";

      // First tokenization
      await propertyRegistry.connect(notary).tokenizeProperty(
        registryNumber,
        "CAD-GT-Z10-003",
        "Guatemala City",
        "10",
        500,
        350,
        0,
        user1.address,
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        250000,
        1950000
      );

      // Attempt duplicate
      await expect(
        propertyRegistry.connect(notary).tokenizeProperty(
          registryNumber,
          "CAD-GT-Z10-003",
          "Guatemala City",
          "10",
          500,
          350,
          0,
          user1.address,
          "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
          250000,
          1950000
        )
      ).to.be.revertedWith("Property already tokenized");
    });
  });

  describe("Property Transfer", function () {
    it("Should request and approve transfer with both authorities", async function () {
      const { propertyRegistry, notary, registry, user1, user2 } = await loadFixture(deployPropertyRegistryFixture);

      // Tokenize property
      await propertyRegistry.connect(notary).tokenizeProperty(
        "RGP-2025-004",
        "CAD-GT-Z10-004",
        "Guatemala City",
        "10",
        500,
        350,
        0,
        user1.address,
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        250000,
        1950000
      );

      const tokenId = 1;

      // Request transfer
      await expect(
        propertyRegistry.connect(user1).requestTransfer(
          tokenId,
          user2.address,
          "QmTransferDoc"
        )
      ).to.emit(propertyRegistry, "TransferRequested");

      // Approve as notary
      await expect(
        propertyRegistry.connect(notary).approveTransferAsNotary(tokenId)
      ).to.emit(propertyRegistry, "TransferApproved");

      // Approve as registry - this should complete the transfer
      await expect(
        propertyRegistry.connect(registry).approveTransferAsRegistry(tokenId)
      ).to.emit(propertyRegistry, "TransferCompleted");

      // Check new owner
      expect(await propertyRegistry.ownerOf(tokenId)).to.equal(user2.address);
      const property = await propertyRegistry.getProperty(tokenId);
      expect(property.currentOwner).to.equal(user2.address);
    });

    it("Should cancel pending transfer", async function () {
      const { propertyRegistry, notary, user1, user2 } = await loadFixture(deployPropertyRegistryFixture);

      // Tokenize property
      await propertyRegistry.connect(notary).tokenizeProperty(
        "RGP-2025-005",
        "CAD-GT-Z10-005",
        "Guatemala City",
        "10",
        500,
        350,
        0,
        user1.address,
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        250000,
        1950000
      );

      const tokenId = 1;

      // Request transfer
      await propertyRegistry.connect(user1).requestTransfer(
        tokenId,
        user2.address,
        "QmTransferDoc"
      );

      // Cancel transfer
      await propertyRegistry.connect(user1).cancelTransfer(tokenId);

      // Try to approve (should fail)
      await expect(
        propertyRegistry.connect(notary).approveTransferAsNotary(tokenId)
      ).to.be.revertedWith("No pending transfer");
    });
  });

  describe("Property Management", function () {
    it("Should update property valuation", async function () {
      const { propertyRegistry, notary, user1 } = await loadFixture(deployPropertyRegistryFixture);

      // Tokenize property
      await propertyRegistry.connect(notary).tokenizeProperty(
        "RGP-2025-006",
        "CAD-GT-Z10-006",
        "Guatemala City",
        "10",
        500,
        350,
        0,
        user1.address,
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        250000,
        1950000
      );

      const tokenId = 1;
      const newValuationUSD = 300000;
      const newValuationGTQ = 2340000;

      await expect(
        propertyRegistry.connect(notary).updateValuation(
          tokenId,
          newValuationUSD,
          newValuationGTQ
        )
      ).to.emit(propertyRegistry, "PropertyValuationUpdated");

      const property = await propertyRegistry.getProperty(tokenId);
      expect(property.valuationUSD).to.equal(newValuationUSD);
      expect(property.valuationGTQ).to.equal(newValuationGTQ);
    });

    it("Should update encumbrance status", async function () {
      const { propertyRegistry, notary, registry, user1 } = await loadFixture(deployPropertyRegistryFixture);

      // Tokenize property
      await propertyRegistry.connect(notary).tokenizeProperty(
        "RGP-2025-007",
        "CAD-GT-Z10-007",
        "Guatemala City",
        "10",
        500,
        350,
        0,
        user1.address,
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        250000,
        1950000
      );

      const tokenId = 1;

      await propertyRegistry.connect(registry).updateEncumbrance(tokenId, true);

      const property = await propertyRegistry.getProperty(tokenId);
      expect(property.hasEncumbrance).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should add and remove verified notaries", async function () {
      const { propertyRegistry, owner, user1 } = await loadFixture(deployPropertyRegistryFixture);

      await propertyRegistry.connect(owner).addVerifiedNotary(user1.address);
      expect(await propertyRegistry.verifiedNotaries(user1.address)).to.be.true;

      await propertyRegistry.connect(owner).removeVerifiedNotary(user1.address);
      expect(await propertyRegistry.verifiedNotaries(user1.address)).to.be.false;
    });

    it("Should update fees", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);

      await propertyRegistry.connect(owner).updateFees(200, 100);
      expect(await propertyRegistry.tokenizationFeeUSD()).to.equal(200);
      expect(await propertyRegistry.transferFeePercent()).to.equal(100);
    });

    it("Should prevent excessive fees", async function () {
      const { propertyRegistry, owner } = await loadFixture(deployPropertyRegistryFixture);

      await expect(
        propertyRegistry.connect(owner).updateFees(200, 300)
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Emergency Functions", function () {
    it("Should pause and unpause contract", async function () {
      const { propertyRegistry, owner, notary, user1 } = await loadFixture(deployPropertyRegistryFixture);

      // Pause contract
      await propertyRegistry.connect(owner).pause();

      // Try to tokenize while paused (should fail)
      await expect(
        propertyRegistry.connect(notary).tokenizeProperty(
          "RGP-2025-008",
          "CAD-GT-Z10-008",
          "Guatemala City",
          "10",
          500,
          350,
          0,
          user1.address,
          "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
          250000,
          1950000
        )
      ).to.be.reverted;

      // Unpause
      await propertyRegistry.connect(owner).unpause();

      // Should work now
      await expect(
        propertyRegistry.connect(notary).tokenizeProperty(
          "RGP-2025-008",
          "CAD-GT-Z10-008",
          "Guatemala City",
          "10",
          500,
          350,
          0,
          user1.address,
          "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
          250000,
          1950000
        )
      ).to.emit(propertyRegistry, "PropertyTokenized");
    });
  });
});