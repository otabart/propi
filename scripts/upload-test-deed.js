const path = require('path');
const fs = require('fs');
const { 
  uploadPropertyDeedFromFile, 
  uploadPropertyDocumentBundle,
  generatePropertyMetadata,
  checkBalance 
} = require('../utils/propertyDocumentUploader');

async function testPropertyDocumentUpload() {
  console.log('🏠 Testing Property Document Upload System\n');

  try {
    // 1. Check Irys balance first
    console.log('💰 Checking Irys balance...');
    const balanceInfo = await checkBalance(1024 * 1024); // Estimate 1MB
    
    if (!balanceInfo.hasSufficientFunds) {
      console.log('❌ Insufficient Irys balance for upload');
      console.log('💡 You can fund your account using the fundAccount() function');
      return;
    }

    // 2. Create test property deed file (PDF simulation)
    const testDeedPath = path.join(__dirname, '../test-files/sample-deed.pdf');
    const testImagePath = path.join(__dirname, '../test-files/sample-property-image.jpg');
    
    // Create test files directory if it doesn't exist
    const testFilesDir = path.join(__dirname, '../test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    // Create a sample PDF file (simulated content)
    if (!fs.existsSync(testDeedPath)) {
      const samplePdfContent = Buffer.from(`
        %PDF-1.4
        1 0 obj
        <<
        /Type /Catalog
        /Pages 2 0 R
        >>
        endobj
        
        2 0 obj
        <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
        >>
        endobj
        
        3 0 obj
        <<
        /Type /Page
        /Parent 2 0 R
        /Contents 4 0 R
        >>
        endobj
        
        4 0 obj
        <<
        /Length 44
        >>
        stream
        BT
        /F1 12 Tf
        100 700 Td
        (TITULO DE PROPIEDAD - GUATEMALA) Tj
        ET
        endstream
        endobj
        
        xref
        0 5
        0000000000 65535 f 
        0000000009 00000 n 
        0000000074 00000 n 
        0000000120 00000 n 
        0000000179 00000 n 
        trailer
        <<
        /Size 5
        /Root 1 0 R
        >>
        startxref
        274
        %%EOF
      `, 'binary');
      
      fs.writeFileSync(testDeedPath, samplePdfContent);
      console.log(`📄 Created sample deed file: ${testDeedPath}`);
    }

    // Create a sample property image
    if (!fs.existsSync(testImagePath)) {
      // Create a minimal JPEG header (placeholder)
      const sampleImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, sampleImageBuffer);
      console.log(`🖼️ Created sample property image: ${testImagePath}`);
    }

    // 3. Test single document upload
    console.log('\n📝 Test 1: Upload single property deed...');
    
    const propertyMetadata = {
      registryNumber: 'RGP-2025-TEST-001',
      municipality: 'Guatemala City',
      zone: '10',
      propertyType: 'Residential',
      ownerAddress: '0x23de198F1520ad386565fc98AEE6abb3Ae5052BE'
    };

    const deedResult = await uploadPropertyDeedFromFile(testDeedPath, propertyMetadata);
    console.log('✅ Deed uploaded:', deedResult.gatewayUrl);

    // 4. Test document bundle upload
    console.log('\n📦 Test 2: Upload document bundle...');
    
    const documentBundle = [
      {
        buffer: fs.readFileSync(testDeedPath),
        filename: 'titulo-propiedad.pdf',
        type: 'property-deed'
      },
      {
        buffer: fs.readFileSync(testImagePath),
        filename: 'property-exterior.jpg',
        type: 'property-image'
      }
    ];

    const bundleResult = await uploadPropertyDocumentBundle(documentBundle, propertyMetadata);
    console.log('✅ Bundle uploaded:', bundleResult.bundleId);
    console.log(`📊 Total size: ${(bundleResult.totalSize / 1024).toFixed(2)} KB`);

    // 5. Test NFT metadata generation
    console.log('\n📋 Test 3: Generate NFT metadata...');
    
    const propertyData = {
      registryNumber: 'RGP-2025-TEST-001',
      municipality: 'Guatemala City',
      zone: '10',
      areaSqMeters: 500,
      constructionSqMeters: 350,
      propertyType: 0, // Residential
      valuationUSD: 250000
    };

    const metadataResult = await generatePropertyMetadata(propertyData, bundleResult.documents);
    console.log('✅ NFT Metadata generated:', metadataResult.metadataUri);

    // 6. Display final results
    console.log('\n🎉 Upload Test Complete!');
    console.log('-----------------------------------');
    console.log('📄 Property Deed:', deedResult.gatewayUrl);
    console.log('📦 Document Bundle:', bundleResult.bundleId);
    console.log('📋 NFT Metadata:', metadataResult.metadataUri);
    console.log('🔗 Metadata Hash:', metadataResult.metadataHash);
    
    console.log('\n📝 For tokenization, use this metadata URI in your smart contract:');
    console.log(`   tokenURI: "${metadataResult.metadataUri}"`);
    
    // Save results for later use
    const results = {
      deedUpload: deedResult,
      documentBundle: bundleResult,
      nftMetadata: metadataResult,
      propertyData: propertyData,
      timestamp: new Date().toISOString()
    };

    const resultsPath = path.join(__dirname, '../test-uploads.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);

  } catch (error) {
    console.error('❌ Upload test failed:', error);
    
    if (error.message.includes('Insufficient balance')) {
      console.log('\n💡 To fund your Irys account:');
      console.log('   const { fundAccount } = require("./utils/propertyDocumentUploader");');
      console.log('   await fundAccount("1000000000000000"); // 0.001 ETH in wei');
    }
  }
}

// Run the test
if (require.main === module) {
  testPropertyDocumentUpload()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testPropertyDocumentUpload };