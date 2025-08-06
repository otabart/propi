const API_BASE_URL = 'http://localhost:3001/api';

// Fetch all properties
async function fetchProperties(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await fetch(`${API_BASE_URL}/properties?${params}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Failed to fetch properties');
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

// Fetch single property
async function fetchProperty(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Property not found');
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

// Fetch platform stats
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Failed to fetch stats');
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalProperties: 0,
      totalValue: 0,
      fundedProperties: 0,
      averageReturn: 0
    };
  }
}

// Utility functions
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}

function getStatusBadge(status) {
  const badges = {
    'ACTIVE': { class: 'bg-black text-white', text: 'FUNDED' },
    'NEW': { class: 'bg-gray-200 text-black', text: 'NEW' },
    'FUNDED': { class: 'bg-black text-white', text: 'FUNDED' },
    'WHOLE_NFT': { class: 'bg-gray-600 text-white', text: 'WHOLE NFT' },
    'COMING_SOON': { class: 'bg-gray-600 text-white', text: 'COMING SOON' }
  };
  
  return badges[status] || { class: 'bg-gray-400 text-white', text: status };
}

function getButtonText(status) {
  switch (status) {
    case 'FUNDED':
      return 'SECONDARY MARKET';
    case 'WHOLE_NFT':
      return 'VIEW DETAILS';
    case 'COMING_SOON':
      return 'GET NOTIFIED';
    default:
      return 'INVEST NOW';
  }
}

function getButtonClass(status) {
  switch (status) {
    case 'FUNDED':
      return 'w-full border border-black text-black py-4 font-bold hover:bg-black hover:text-white transition-colors';
    case 'COMING_SOON':
      return 'w-full border border-gray-600 text-gray-600 py-4 font-bold hover:bg-gray-600 hover:text-white transition-colors';
    default:
      return 'w-full bg-black text-white py-4 font-bold hover:bg-gray-900 transition-colors';
  }
}