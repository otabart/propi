const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/propius';

app.use(cors());
app.use(express.json());

let db;

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('propius');
    initializeData();
  })
  .catch(error => console.error(error));

async function initializeData() {
  const properties = db.collection('properties');
  const count = await properties.countDocuments();
  
  if (count === 0) {
    console.log('Initializing property data...');
    await properties.insertMany([
      {
        id: 'prop-001',
        title: 'FAMILY HOME, ZONE 15',
        type: 'RESIDENTIAL',
        location: 'Zone 15, Guatemala City',
        totalValue: 75000,
        sharePrice: 250,
        minInvestment: 1000,
        estReturn: 8.5,
        sharesSold: 225,
        totalShares: 300,
        status: 'ACTIVE',
        fundingProgress: 75,
        image: 'R',
        description: 'Beautiful family home in prestigious Zone 15',
        documents: {
          propertyTitle: 'ar://abc123',
          rgpCertification: 'ar://def456',
          photos: ['ar://photo1', 'ar://photo2']
        },
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prop-002',
        title: 'OFFICE BUILDING, ZONE 10',
        type: 'COMMERCIAL',
        location: 'Zone 10, Guatemala City',
        totalValue: 2500000,
        sharePrice: 250,
        minInvestment: 10000,
        estReturn: 12.0,
        sharesSold: 0,
        totalShares: 10000,
        status: 'NEW',
        fundingProgress: 0,
        image: 'C',
        description: 'Prime commercial space in financial district',
        documents: {
          propertyTitle: 'ar://xyz789',
          rgpCertification: 'ar://uvw012'
        },
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prop-003',
        title: 'AGRICULTURAL LAND, PETEN',
        type: 'AGRICULTURAL',
        location: 'Peten, Guatemala',
        totalValue: 125000,
        sharePrice: 250,
        minInvestment: 500,
        estReturn: 6.8,
        sharesSold: 200,
        totalShares: 500,
        status: 'ACTIVE',
        fundingProgress: 40,
        image: 'A',
        description: 'Fertile agricultural land with high potential',
        documents: {
          propertyTitle: 'ar://agr123',
          rgpCertification: 'ar://agr456'
        },
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prop-004',
        title: 'LUXURY VILLA, ZONE 14',
        type: 'LUXURY',
        location: 'Zone 14, Guatemala City',
        totalValue: 450000,
        sharePrice: null,
        minInvestment: 450000,
        estReturn: 5.2,
        sharesSold: null,
        totalShares: null,
        status: 'WHOLE_NFT',
        fundingProgress: 0,
        image: 'L',
        description: 'Exclusive luxury villa in prime location',
        documents: {
          propertyTitle: 'ar://lux123',
          rgpCertification: 'ar://lux456'
        },
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prop-005',
        title: 'RETAIL SPACE, ZONE 1',
        type: 'COMMERCIAL',
        location: 'Zone 1, Guatemala City',
        totalValue: 180000,
        sharePrice: 250,
        minInvestment: 2500,
        estReturn: 9.2,
        sharesSold: 720,
        totalShares: 720,
        status: 'FUNDED',
        fundingProgress: 100,
        image: 'S',
        description: 'High-traffic retail space in historic center',
        documents: {
          propertyTitle: 'ar://ret123',
          rgpCertification: 'ar://ret456'
        },
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prop-006',
        title: 'COLONIAL HOUSE, ANTIGUA',
        type: 'COLONIAL',
        location: 'Antigua Guatemala',
        totalValue: 320000,
        sharePrice: 250,
        minInvestment: 2000,
        estReturn: 7.5,
        sharesSold: 0,
        totalShares: 1280,
        status: 'COMING_SOON',
        fundingProgress: 25,
        image: 'H',
        description: 'Historic colonial house in UNESCO World Heritage site',
        documents: {
          propertyTitle: 'ar://col123',
          rgpCertification: 'ar://col456'
        },
        verified: false,
        launchDate: '2025-03-01',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Property data initialized');
  }
}

// API Routes
app.get('/api/properties', async (req, res) => {
  try {
    const { type, status, limit = 20 } = req.query;
    
    let query = {};
    if (type && type !== 'ALL') query.type = type.toUpperCase();
    if (status) query.status = status.toUpperCase();
    
    const properties = await db.collection('properties')
      .find(query)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch properties' 
    });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await db.collection('properties')
      .findOne({ id: req.params.id });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property'
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const properties = db.collection('properties');
    
    const totalProperties = await properties.countDocuments();
    const totalValue = await properties.aggregate([
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ]).toArray();
    
    const fundedProperties = await properties.countDocuments({ 
      status: 'FUNDED' 
    });
    
    res.json({
      success: true,
      data: {
        totalProperties,
        totalValue: totalValue[0]?.total || 0,
        fundedProperties,
        averageReturn: 8.2
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Start tokenization process
app.post('/api/tokenize', async (req, res) => {
  try {
    const { 
      walletAddress, 
      propertyAddress, 
      estimatedValue, 
      tokenizationType 
    } = req.body;
    
    // Validate required fields
    if (!walletAddress || !propertyAddress || !estimatedValue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Create new tokenization request
    const tokenizationRequest = {
      id: `token-${Date.now()}`,
      walletAddress,
      propertyAddress,
      estimatedValue,
      tokenizationType: tokenizationType || 'fractional',
      status: 'pending_documents',
      documentsUploaded: false,
      notaryVerified: false,
      contractDeployed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database
    const tokenizations = db.collection('tokenizations');
    await tokenizations.insertOne(tokenizationRequest);
    
    res.json({
      success: true,
      data: tokenizationRequest
    });
  } catch (error) {
    console.error('Error starting tokenization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start tokenization process'
    });
  }
});

// Get tokenization requests for a wallet
app.get('/api/tokenize/:walletAddress', async (req, res) => {
  try {
    const tokenizations = db.collection('tokenizations');
    const requests = await tokenizations
      .find({ walletAddress: req.params.walletAddress })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching tokenization requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tokenization requests'
    });
  }
});

// Update tokenization with document links
app.post('/api/tokenize/:propertyId/documents', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { arweaveLinks, documentsUploaded, status } = req.body;
    
    const tokenizations = db.collection('tokenizations');
    const result = await tokenizations.updateOne(
      { id: propertyId },
      {
        $set: {
          arweaveLinks,
          documentsUploaded,
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Documents updated successfully'
    });
  } catch (error) {
    console.error('Error updating documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update documents'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});