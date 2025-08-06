require('dotenv').config();
const { Uploader } = require('@irys/upload');
const { Ethereum } = require('@irys/upload-ethereum');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Property Document Uploader for Propius Platform
 * Adapts Irys integration for Guatemala property documents
 */

const getIrysUploader = async () => {
  try {
    const irysUploader = await Uploader(Ethereum)
      .withWallet(process.env.PRIVATE_KEY)
      .withRpc(process.env.SEPOLIA_RPC)
      .devnet();
    
    return irysUploader;
  } catch (error) {
    console.error('Error initializing Irys uploader:', error);
    throw error;
  }
};

/**
 * Upload property deed or related documents to Irys/Arweave
 */
const uploadPropertyDocument = async (buffer, filename, metadata = {}) => {
  try {
    console.log(`📄 Uploading Property Document: ${filename}`);
    console.log(`   - File size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid buffer provided - not a Buffer object');
    }
    
    if (buffer.length === 0) {
      throw new Error('Empty buffer provided');
    }
    
    // Create hash for integrity verification
    const documentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    console.log(`   - Document SHA256: ${documentHash}`);
    
    const irysUploader = await getIrysUploader();
    
    // Check cost and balance
    const price = await irysUploader.getPrice(buffer.length);
    const balance = await irysUploader.getBalance();
    console.log(`💰 Upload cost: ${price} wei, Balance: ${balance} wei`);
    
    if (BigInt(balance) < BigInt(price)) {
      throw new Error(`Insufficient balance. Need: ${price} wei, Have: ${balance} wei`);
    }
    
    // Determine content type
    const contentType = getContentType(filename);
    console.log(`   - Content-Type: ${contentType}`);
    
    // Prepare metadata tags
    const tags = [
      { name: 'Content-Type', value: contentType },
      { name: 'Filename', value: filename },
      { name: 'Document-Hash', value: documentHash },
      { name: 'File-Size', value: buffer.length.toString() },
      { name: 'Upload-Timestamp', value: new Date().toISOString() },
      { name: 'Platform', value: 'Propius' },
      { name: 'Document-Type', value: metadata.documentType || 'property-document' },
      { name: 'Country', value: 'Guatemala' }
    ];

    // Add property-specific metadata if provided
    if (metadata.registryNumber) {
      tags.push({ name: 'Registry-Number', value: metadata.registryNumber });
    }
    if (metadata.propertyType) {
      tags.push({ name: 'Property-Type', value: metadata.propertyType });
    }
    if (metadata.municipality) {
      tags.push({ name: 'Municipality', value: metadata.municipality });
    }
    if (metadata.zone) {
      tags.push({ name: 'Zone', value: metadata.zone });
    }
    if (metadata.ownerAddress) {
      tags.push({ name: 'Owner-Address', value: metadata.ownerAddress });
    }
    
    console.log(`🚀 Uploading to Arweave via Irys...`);
    const receipt = await irysUploader.upload(buffer, { tags });
    
    const arweaveUrl = `https://devnet.irys.xyz/${receipt.id}`;
    const gatewayUrl = `https://gateway.irys.xyz/${receipt.id}`;
    
    console.log(`✅ Document uploaded successfully!`);
    console.log(`   - Transaction ID: ${receipt.id}`);
    console.log(`   - Irys URL: ${arweaveUrl}`);
    console.log(`   - Gateway URL: ${gatewayUrl}`);
    
    return {
      id: receipt.id,
      url: arweaveUrl,
      gatewayUrl: gatewayUrl,
      arUrl: `ar://${receipt.id}`,
      documentHash: documentHash,
      size: buffer.length,
      contentType: contentType,
      tags: tags.reduce((obj, tag) => ({ ...obj, [tag.name]: tag.value }), {})
    };
    
  } catch (error) {
    console.error('❌ Document upload error:', error);
    throw error;
  }
};

/**
 * Upload property deed from file path
 */
const uploadPropertyDeedFromFile = async (filePath, metadata = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    console.log(`📁 Reading deed file: ${filePath}`);
    console.log(`   - Filename: ${filename}`);
    
    // Add document type for deeds
    metadata.documentType = 'property-deed';
    
    return await uploadPropertyDocument(buffer, filename, metadata);
    
  } catch (error) {
    console.error('❌ Error uploading deed from file:', error);
    throw error;
  }
};

/**
 * Upload multiple property documents (deed, images, certificates, etc.)
 */
const uploadPropertyDocumentBundle = async (documents, metadata = {}) => {
  try {
    console.log(`📦 Uploading document bundle (${documents.length} files)...`);
    
    const results = [];
    
    for (const doc of documents) {
      const { buffer, filename, type } = doc;
      const docMetadata = { ...metadata, documentType: type || 'property-document' };
      
      const result = await uploadPropertyDocument(buffer, filename, docMetadata);
      results.push({
        type: type,
        filename: filename,
        ...result
      });
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Bundle upload complete! ${results.length} documents uploaded.`);
    
    return {
      bundleId: crypto.randomUUID(),
      documents: results,
      totalSize: results.reduce((sum, doc) => sum + doc.size, 0),
      uploadedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Bundle upload error:', error);
    throw error;
  }
};

/**
 * Generate JSON metadata for property NFT
 */
const generatePropertyMetadata = async (propertyData, documentResults) => {
  try {
    const metadata = {
      name: `Property ${propertyData.registryNumber}`,
      description: `Guatemala Property Token for ${propertyData.municipality}, Zone ${propertyData.zone}`,
      image: documentResults.find(doc => doc.type === 'property-image')?.gatewayUrl || '',
      external_url: `https://propius.gt/property/${propertyData.registryNumber}`,
      
      attributes: [
        {
          trait_type: "Registry Number",
          value: propertyData.registryNumber
        },
        {
          trait_type: "Municipality",
          value: propertyData.municipality
        },
        {
          trait_type: "Zone",
          value: propertyData.zone
        },
        {
          trait_type: "Area (m²)",
          value: propertyData.areaSqMeters,
          display_type: "number"
        },
        {
          trait_type: "Construction (m²)",
          value: propertyData.constructionSqMeters,
          display_type: "number"
        },
        {
          trait_type: "Property Type",
          value: getPropertyTypeName(propertyData.propertyType)
        },
        {
          trait_type: "Valuation (USD)",
          value: propertyData.valuationUSD,
          display_type: "number"
        },
        {
          trait_type: "Country",
          value: "Guatemala"
        }
      ],
      
      documents: documentResults.map(doc => ({
        type: doc.type,
        filename: doc.filename,
        url: doc.gatewayUrl,
        hash: doc.documentHash,
        size: doc.size
      })),
      
      verification: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        platform: "Propius"
      }
    };
    
    // Upload metadata JSON to Irys
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const metadataFilename = `${propertyData.registryNumber}-metadata.json`;
    
    const metadataResult = await uploadPropertyDocument(
      metadataBuffer, 
      metadataFilename, 
      { 
        documentType: 'nft-metadata',
        registryNumber: propertyData.registryNumber
      }
    );
    
    console.log(`📋 Property metadata uploaded: ${metadataResult.gatewayUrl}`);
    
    return {
      metadata: metadata,
      metadataUri: metadataResult.gatewayUrl,
      metadataHash: metadataResult.documentHash
    };
    
  } catch (error) {
    console.error('❌ Metadata generation error:', error);
    throw error;
  }
};

// Helper functions
const getContentType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const contentTypes = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'json': 'application/json',
    
    // Default
    'default': 'application/octet-stream'
  };
  
  return contentTypes[ext] || contentTypes['default'];
};

const getPropertyTypeName = (typeNumber) => {
  const types = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed'];
  return types[typeNumber] || 'Unknown';
};

// Balance and funding helpers
const checkBalance = async (estimatedSize) => {
  try {
    const irysUploader = await getIrysUploader();
    const price = await irysUploader.getPrice(estimatedSize);
    const balance = await irysUploader.getBalance();
    
    console.log(`💰 Irys Balance: ${balance} wei`);
    console.log(`💵 Estimated cost: ${price} wei`);
    console.log(`✅ Sufficient funds: ${BigInt(balance) >= BigInt(price)}`);
    
    return {
      balance: balance.toString(),
      estimatedCost: price.toString(),
      hasSufficientFunds: BigInt(balance) >= BigInt(price)
    };
  } catch (error) {
    console.error('❌ Balance check error:', error);
    throw error;
  }
};

const fundAccount = async (amount) => {
  try {
    const irysUploader = await getIrysUploader();
    const receipt = await irysUploader.fund(amount);
    console.log(`💸 Funded Irys account with ${amount} wei`);
    return receipt;
  } catch (error) {
    console.error('❌ Funding error:', error);
    throw error;
  }
};

module.exports = {
  uploadPropertyDocument,
  uploadPropertyDeedFromFile,
  uploadPropertyDocumentBundle,
  generatePropertyMetadata,
  checkBalance,
  fundAccount,
  getContentType,
  getPropertyTypeName
};