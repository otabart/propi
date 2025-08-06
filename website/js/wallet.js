// Wallet Connection and Language Toggle
let currentLanguage = localStorage.getItem('propi-language') || 'es';
let isWalletConnected = false;
let walletAddress = null;

// Language Translations
const translations = {
    en: {
        // Navigation
        'ACERCA DE': 'ABOUT',
        'PROPIEDADES': 'PROPERTIES', 
        'CÓMO FUNCIONA': 'HOW IT WORKS',
        'CONECTAR BILLETERA': 'CONNECT WALLET',
        
        // Homepage
        'TU PROPIEDAD,': 'YOUR PROPERTY,',
        'TU TOKEN': 'YOUR TOKEN',
        'La primera plataforma de tokenización de propiedades conforme para Guatemala. Invierte en bienes raíces   o tokeniza tu propiedad.': 'The first compliant property tokenization platform for Guatemala. Invest in real estate from  or tokenize your property.',
        'EXPLORAR PROPIEDADES': 'BROWSE PROPERTIES',
        'TOKENIZAR PROPIEDAD': 'TOKENIZE PROPERTY',
        'INVERSIÓN MÍNIMA': '',
        'PROPIEDADES DESTACADAS': 'FEATURED PROPERTIES',
        'Propiedades reales de Guatemala en las que puedes invertir hoy': 'Real Guatemala properties you can invest in today',
        'C\u00d3MO FUNCIONA': 'HOW IT WORKS',
        'Tres pasos simples para la tokenizaci\u00f3n de propiedades': 'Three simple steps to property tokenization',
        'SUBIR DOCUMENTOS': 'UPLOAD DOCUMENTS',
        'Sube el t\u00edtulo de propiedad y documentos. Verificados por notarios, almacenados permanentemente en blockchain.': 'Upload property deed and documents. Verified by notaries, stored permanently on blockchain.',
        'ELEGIR TIPO': 'CHOOSE TYPE',
        'Mant\u00e9n como NFT \u00fanico o divide en acciones. Establece t\u00e9rminos de inversi\u00f3n y distribuci\u00f3n de ingresos.': 'Keep as single NFT or split into shares. Set investment terms and revenue sharing.',
        'INVERTIR Y GANAR': 'INVEST & EARN',
        'Los tokens se vuelven comerciables. Los ingresos por alquiler se distribuyen autom\u00e1ticamente a todos los poseedores.': 'Tokens become tradeable. Rental income automatically distributed to all holders.',
        '\u00bfLISTO PARA COMENZAR?': 'READY TO GET STARTED?',
        'Conecta tu billetera y comienza a invertir en bienes ra\u00edces de Guatemala o tokeniza tu propiedad.': 'Connect your wallet and start investing in Guatemala real estate or tokenize your property.',
        'CONECTAR BILLETERA / CONECTAR BILLETERA': 'CONNECT WALLET',
        'APRENDER M\u00c1S': 'LEARN MORE',
        'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA PATROCINA LAS TRANSACCIONES \u2022  ': 'NO SIGN-UP REQUIRED \u2022 YOUR WALLET SPONSORS TRANSACTIONS \u2022  ',
        
        // Properties Page
        'PROPIEDADES DE INVERSI\u00d3N': 'INVESTMENT PROPERTIES',
        'Invierte en bienes ra\u00edces de Guatemala  . Todas las propiedades est\u00e1n verificadas y son legalmente conformes.': 'Invest in Guatemala real estate  . All properties are verified and legally compliant.',
        'TODAS': 'ALL',
        'CARGAR M\u00c1S PROPIEDADES': 'LOAD MORE PROPERTIES',
        '\u00bfLISTO PARA INVERTIR?': 'READY TO INVEST?',
        'Conecta tu billetera para comenzar a invertir en bienes ra\u00edces de Guatemala.': 'Connect your wallet to start investing in Guatemala real estate.',
        'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA MANEJA TODAS LAS TRANSACCIONES': 'NO SIGN-UP REQUIRED \u2022 YOUR WALLET HANDLES ALL TRANSACTIONS',
        
        // About Page
        'ACERCA DE PROPI': 'ABOUT PROPI',
        'La primera plataforma de tokenizaci\u00f3n de propiedades conforme en Guatemala. Democratizando la inversi\u00f3n inmobiliaria a trav\u00e9s de la tecnolog\u00eda blockchain.': 'Guatemala\'s first compliant property tokenization platform. Democratizing real estate investment through blockchain technology.',
        '\u00bfQU\u00c9 ES EL RGP?': 'WHAT IS RGP?',
        'POR QU\u00c9 IMPORTA EL RGP PARA PROPI': 'WHY RGP MATTERS FOR PROPI',
        'PONTE EN CONTACTO': 'GET IN TOUCH',
        '\u00bfListo para tokenizar tu propiedad o comenzar a invertir? Con\u00e9ctate con nuestro equipo.': 'Ready to tokenize your property or start investing? Connect with our team.',
        'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA PATROCINA LAS TRANSACCIONES \u2022  ': 'NO SIGN-UP REQUIRED \u2022 YOUR WALLET SPONSORS TRANSACTIONS \u2022  ',
        
        // How It Works Page
        'C\u00f3mo Funciona Propi': 'How Propi Works',
        'Del t\u00edtulo de propiedad al token blockchain en 6 pasos simples': 'From property deed to blockchain token in 6 simple steps',
        'Subir Documentos de Propiedad': 'Upload Property Documents',
        'Certificaci\u00f3n RGP': 'RGP Certification',
        'Fotos de la propiedad': 'Property photos',
        'Permisos municipales': 'Municipal permits',
        'Verificaci\u00f3n Notarial': 'Notary Verification',
        'Elegir Tipo de Tokenizaci\u00f3n': 'Choose Tokenization Type',
        'Despliegue de Contrato Inteligente': 'Smart Contract Deployment',
        'Inversi\u00f3n y KYC': 'Investment & KYC',
        'Gesti\u00f3n Continua': 'Ongoing Management',
        'Resultado: Bienes Ra\u00edces L\u00edquidos': 'Result: Liquid Real Estate',
        '\u00bfListo para Comenzar?': 'Ready to Start?',
        'Sin registro requerido. Tu billetera patrocina las transacciones. Comienza con .': 'No sign-up required. Your wallet sponsors transactions. Start with .',
        
        // Flow Chart Page
        'FLUJO DE PLATAFORMA': 'PLATFORM FLOW',
        'Gu\u00eda visual para la tokenizaci\u00f3n de propiedades en Propi': 'Visual guide to property tokenization on Propi',
        'EL PROPIETARIO SUBE DOCUMENTOS': 'PROPERTY OWNER UPLOADS DOCUMENTS',
        'PROCESO DE VERIFICACI\u00d3N NOTARIAL': 'NOTARY VERIFICATION PROCESS',
        'EL PROPIETARIO ELIGE EL TIPO DE TOKENIZACI\u00d3N': 'OWNER CHOOSES TOKENIZATION TYPE',
        'EJECUCI\u00d3N DE CONTRATO INTELIGENTE': 'SMART CONTRACT EXECUTION',
        'PROCESO DE INVERSI\u00d3N Y KYC': 'INVESTMENT & KYC PROCESS',
        'GESTI\u00d3N CONTINUA DE PROPIEDADES': 'ONGOING PROPERTY MANAGEMENT',
        'ARQUITECTURA T\u00c9CNICA': 'TECHNICAL ARCHITECTURE',
        '\u00bfLISTO PARA COMENZAR?': 'READY TO START?',
        'Conecta tu billetera para comenzar a invertir en bienes ra\u00edces de Guatemala o tokenizar tu propiedad.': 'Connect your wallet to start investing in Guatemala real estate or tokenize your property.',
        'VER PROPIEDADES': 'VIEW PROPERTIES',
        'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA PATROCINA LAS TRANSACCIONES \u2022  ': 'NO SIGN-UP REQUIRED \u2022 YOUR WALLET SPONSORS TRANSACTIONS \u2022  '
    },
    es: {
        // Navigation
        'ABOUT': 'ACERCA DE',
        'PROPERTIES': 'PROPIEDADES',
        'HOW IT WORKS': 'C\u00d3MO FUNCIONA', 
        'CONNECT WALLET': 'CONECTAR BILLETERA',
        
        // Homepage
        'YOUR PROPERTY,': 'TU PROPIEDAD,',
        'YOUR TOKEN': 'TU TOKEN',
        'The first compliant property tokenization platform for Guatemala. Invest in real estate from  or tokenize your property.': 'La primera plataforma de tokenización de propiedades conforme para Guatemala. Invierte en bienes raíces   o tokeniza tu propiedad.',
        'BROWSE PROPERTIES': 'EXPLORAR PROPIEDADES',
        'TOKENIZE PROPERTY': 'TOKENIZAR PROPIEDAD',
        '': 'INVERSIÓN MÍNIMA',
        'FEATURED PROPERTIES': 'PROPIEDADES DESTACADAS',
        'Real Guatemala properties you can invest in today': 'Propiedades reales de Guatemala en las que puedes invertir hoy',
        'Three simple steps to property tokenization': 'Tres pasos simples para la tokenizaci\u00f3n de propiedades',
        'UPLOAD DOCUMENTS': 'SUBIR DOCUMENTOS',
        'Upload property deed and documents. Verified by notaries, stored permanently on blockchain.': 'Sube el t\u00edtulo de propiedad y documentos. Verificados por notarios, almacenados permanentemente en blockchain.',
        'CHOOSE TYPE': 'ELEGIR TIPO',
        'Keep as single NFT or split into shares. Set investment terms and revenue sharing.': 'Mant\u00e9n como NFT \u00fanico o divide en acciones. Establece t\u00e9rminos de inversi\u00f3n y distribuci\u00f3n de ingresos.',
        'INVEST & EARN': 'INVERTIR Y GANAR',
        'Tokens become tradeable. Rental income automatically distributed to all holders.': 'Los tokens se vuelven comerciables. Los ingresos por alquiler se distribuyen autom\u00e1ticamente a todos los poseedores.',
        'READY TO GET STARTED?': '\u00bfLISTO PARA COMENZAR?',
        'Connect your wallet and start investing in Guatemala real estate or tokenize your property.': 'Conecta tu billetera y comienza a invertir en bienes ra\u00edces de Guatemala o tokeniza tu propiedad.',
        'LEARN MORE': 'APRENDER M\u00c1S',
        'NO SIGN-UP REQUIRED \u2022 YOUR WALLET SPONSORS TRANSACTIONS \u2022  ': 'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA PATROCINA LAS TRANSACCIONES \u2022  ',
        
        // Properties Page
        'INVESTMENT PROPERTIES': 'PROPIEDADES DE INVERSI\u00d3N',
        'Invest in Guatemala real estate  . All properties are verified and legally compliant.': 'Invierte en bienes ra\u00edces de Guatemala  . Todas las propiedades est\u00e1n verificadas y son legalmente conformes.',
        'ALL': 'TODAS',
        'LOAD MORE PROPERTIES': 'CARGAR M\u00c1S PROPIEDADES',
        'READY TO INVEST?': '\u00bfLISTO PARA INVERTIR?',
        'Connect your wallet to start investing in Guatemala real estate.': 'Conecta tu billetera para comenzar a invertir en bienes ra\u00edces de Guatemala.',
        'NO SIGN-UP REQUIRED \u2022 YOUR WALLET HANDLES ALL TRANSACTIONS': 'SIN REGISTRO REQUERIDO \u2022 TU BILLETERA MANEJA TODAS LAS TRANSACCIONES',
        
        // About Page
        'ABOUT PROPI': 'ACERCA DE PROPI',
        'Guatemala\'s first compliant property tokenization platform. Democratizing real estate investment through blockchain technology.': 'La primera plataforma de tokenizaci\u00f3n de propiedades conforme en Guatemala. Democratizando la inversi\u00f3n inmobiliaria a trav\u00e9s de la tecnolog\u00eda blockchain.',
        'WHAT IS RGP?': '\u00bfQU\u00c9 ES EL RGP?',
        'WHY RGP MATTERS FOR PROPI': 'POR QU\u00c9 IMPORTA EL RGP PARA PROPI',
        'GET IN TOUCH': 'PONTE EN CONTACTO',
        'Ready to tokenize your property or start investing? Connect with our team.': '\u00bfListo para tokenizar tu propiedad o comenzar a invertir? Con\u00e9ctate con nuestro equipo.',
        
        // How It Works Page
        'How Propi Works': 'C\u00f3mo Funciona Propi',
        'From property deed to blockchain token in 6 simple steps': 'Del t\u00edtulo de propiedad al token blockchain en 6 pasos simples',
        'Upload Property Documents': 'Subir Documentos de Propiedad',
        'RGP Certification': 'Certificaci\u00f3n RGP',
        'Property photos': 'Fotos de la propiedad',
        'Municipal permits': 'Permisos municipales',
        'Notary Verification': 'Verificaci\u00f3n Notarial',
        'Choose Tokenization Type': 'Elegir Tipo de Tokenizaci\u00f3n',
        'Smart Contract Deployment': 'Despliegue de Contrato Inteligente',
        'Investment & KYC': 'Inversi\u00f3n y KYC',
        'Ongoing Management': 'Gesti\u00f3n Continua',
        'Result: Liquid Real Estate': 'Resultado: Bienes Ra\u00edces L\u00edquidos',
        'Ready to Start?': '\u00bfListo para Comenzar?',
        'No sign-up required. Your wallet sponsors transactions. Start with .': 'Sin registro requerido. Tu billetera patrocina las transacciones. Comienza con .',
        
        // Flow Chart Page
        'PLATFORM FLOW': 'FLUJO DE PLATAFORMA',
        'Visual guide to property tokenization on Propi': 'Gu\u00eda visual para la tokenizaci\u00f3n de propiedades en Propi',
        'PROPERTY OWNER UPLOADS DOCUMENTS': 'EL PROPIETARIO SUBE DOCUMENTOS',
        'NOTARY VERIFICATION PROCESS': 'PROCESO DE VERIFICACI\u00d3N NOTARIAL',
        'OWNER CHOOSES TOKENIZATION TYPE': 'EL PROPIETARIO ELIGE EL TIPO DE TOKENIZACI\u00d3N',
        'SMART CONTRACT EXECUTION': 'EJECUCI\u00d3N DE CONTRATO INTELIGENTE',
        'INVESTMENT & KYC PROCESS': 'PROCESO DE INVERSI\u00d3N Y KYC',
        'ONGOING PROPERTY MANAGEMENT': 'GESTI\u00d3N CONTINUA DE PROPIEDADES',
        'TECHNICAL ARCHITECTURE': 'ARQUITECTURA T\u00c9CNICA',
        'VIEW PROPERTIES': 'VER PROPIEDADES'
    }
};

// Initialize wallet functionality
document.addEventListener('DOMContentLoaded', function() {
    setupWalletButtons();
    setupLanguageToggle();
    checkWalletConnection();
    
    // Apply translations on page load
    setTimeout(() => {
        applyTranslations();
        
        // Set initial language toggle button text
        const langButtons = document.querySelectorAll('button');
        langButtons.forEach(btn => {
            if (btn.textContent === 'EN' || btn.textContent === 'ES') {
                btn.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
            }
        });
    }, 100);
});

// Setup wallet connection buttons
function setupWalletButtons() {
    document.querySelectorAll('button').forEach(button => {
        const text = button.textContent.trim();
        if (text.includes('CONNECT WALLET') || 
            text.includes('CONECTAR BILLETERA') ||
            text.includes('CONNECT') ||
            text.includes('WALLET')) {
            button.addEventListener('click', handleWalletConnection);
            console.log('Added wallet listener to:', text);
        }
    });
}

// Handle wallet connection
async function handleWalletConnection() {
    if (isWalletConnected) {
        // Wallet already connected, don't show flow
        return;
    }

    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to connect your wallet');
            return;
        }

        // Request wallet connection
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (accounts.length > 0) {
            walletAddress = accounts[0];
            isWalletConnected = true;
            updateWalletButtons();
            
            // Show success notification
            showNotification('Wallet connected successfully!', 'success');
            
            // Update button text to show tokenization option
            setTimeout(() => {
                updateWalletButtons('TOKENIZE PROPERTY');
            }, 2000);
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

// Disconnect wallet
function disconnectWallet() {
    isWalletConnected = false;
    walletAddress = null;
    
    // Remove wallet container and restore original button
    const walletContainer = document.getElementById('wallet-container');
    if (walletContainer) {
        const connectBtn = document.createElement('button');
        connectBtn.className = 'px-6 py-3 bg-black text-white font-bold hover:bg-gray-900 transition-colors';
        connectBtn.textContent = 'CONNECT WALLET';
        connectBtn.addEventListener('click', handleWalletConnection);
        
        walletContainer.parentNode.replaceChild(connectBtn, walletContainer);
    }
    
    // Remove any old tokenize buttons
    const oldTokenizeBtn = document.getElementById('tokenize-btn');
    if (oldTokenizeBtn) {
        oldTokenizeBtn.remove();
    }
    
    showNotification('Wallet disconnected', 'info');
}

// Update wallet button text
function updateWalletButtons(customText = null) {
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('CONNECT WALLET') || 
            button.textContent.includes('CONECTAR BILLETERA') ||
            button.textContent.includes('0x')) {
            
            if (customText) {
                button.textContent = customText;
            } else if (isWalletConnected) {
                // Replace wallet button with sleek wallet info
                const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-3)}`;
                
                // Create sleek wallet container
                if (!document.getElementById('wallet-container')) {
                    const walletContainer = document.createElement('div');
                    walletContainer.id = 'wallet-container';
                    walletContainer.className = 'flex items-center space-x-3';
                    
                    // Wallet address display
                    const walletDisplay = document.createElement('div');
                    walletDisplay.className = 'flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-mono bg-gray-50';
                    walletDisplay.innerHTML = `
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>${shortAddress}</span>
                    `;
                    
                    // Disconnect button (tiny X)
                    const disconnectBtn = document.createElement('button');
                    disconnectBtn.className = 'w-6 h-6 border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 text-xs flex items-center justify-center bg-white';
                    disconnectBtn.innerHTML = '×';
                    disconnectBtn.title = 'Disconnect wallet';
                    disconnectBtn.addEventListener('click', disconnectWallet);
                    
                    // Tokenize button (sleek)
                    const tokenizeBtn = document.createElement('button');
                    tokenizeBtn.className = 'px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors';
                    tokenizeBtn.textContent = 'TOKENIZE';
                    tokenizeBtn.addEventListener('click', showPropertyUploadFlow);
                    
                    walletContainer.appendChild(walletDisplay);
                    walletContainer.appendChild(disconnectBtn);
                    walletContainer.appendChild(tokenizeBtn);
                    
                    // Replace the original button
                    button.parentNode.replaceChild(walletContainer, button);
                }
            }
        }
    });
}

// Show property upload flow
function showPropertyUploadFlow() {
    // Create modal for property tokenization
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4';
    modal.innerHTML = `
        <div class="bg-white max-w-4xl mx-auto my-8 shadow-2xl border border-gray-200 max-h-full overflow-y-auto">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                <h2 class="text-3xl font-black mb-2">TOKENIZAR TU PROPIEDAD</h2>
                <h3 class="text-xl font-light opacity-90">TOKENIZE YOUR PROPERTY</h3>
                <p class="text-blue-100 mt-4">Completa los detalles para tokenizar tu propiedad en Guatemala con cumplimiento RGP</p>
            </div>
            
            <!-- Progress Indicator -->
            <div class="bg-gray-50 p-4 border-b">
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <span class="font-semibold text-blue-600">Información Básica</span>
                    </div>
                    <div class="text-gray-400">→</div>
                    <div class="flex items-center space-x-2 text-gray-400">
                        <div class="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center">2</div>
                        <span>Documentos</span>
                    </div>
                    <div class="text-gray-400">→</div>
                    <div class="flex items-center space-x-2 text-gray-400">
                        <div class="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center">3</div>
                        <span>Verificación</span>
                    </div>
                </div>
            </div>

            <div class="p-8">
                <!-- Section 1: Información de Ubicación (Expandable) -->
                <div class="mb-6 border border-gray-200 rounded-lg">
                    <button type="button" class="w-full p-4 bg-gray-50 hover:bg-blue-50 flex justify-between items-center transition-colors" onclick="toggleSection('location-section')">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                📍
                            </div>
                            <div class="text-left">
                                <h4 class="text-lg font-bold text-gray-900">Información de Ubicación</h4>
                                <p class="text-sm text-gray-600">Departamento, municipio y dirección exacta</p>
                            </div>
                        </div>
                        <div class="transform transition-transform" id="location-arrow">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>
                    <div id="location-section" class="hidden p-6 space-y-4 bg-white">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">TIPO DE PROPIEDAD *</label>
                                <select id="propertyType" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors">
                                    <option value="">Selecciona el tipo...</option>
                                    <option value="casa">Casa (House)</option>
                                    <option value="apartamento">Apartamento (Apartment)</option>
                                    <option value="edificio">Edificio (Building)</option>
                                    <option value="oficina">Oficina (Office)</option>
                                    <option value="bodega">Bodega (Warehouse)</option>
                                    <option value="local">Local Comercial (Commercial Space)</option>
                                    <option value="finca">Finca (Farm/Estate)</option>
                                    <option value="terreno">Terreno (Land)</option>
                                    <option value="industrial">Propiedad Industrial (Industrial Property)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">DEPARTAMENTO DE GUATEMALA *</label>
                                <select id="department" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors">
                                    <option value="">Selecciona departamento...</option>
                                    <option value="guatemala">Guatemala</option>
                                    <option value="antigua">Sacatepéquez (Antigua)</option>
                                    <option value="chimaltenango">Chimaltenango</option>
                                    <option value="escuintla">Escuintla</option>
                                    <option value="peten">Petén</option>
                                    <option value="quetzaltenango">Quetzaltenango</option>
                                    <option value="huehuetenango">Huehuetenango</option>
                                    <option value="otros">Otros Departamentos</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-900 mb-2">MUNICIPIO *</label>
                            <input type="text" id="municipality" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="ej: Guatemala, Mixco, Villa Nueva">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-900 mb-2">DIRECCIÓN EXACTA *</label>
                            <textarea id="address" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors h-24" placeholder="Dirección completa incluyendo zona, colonia o barrio"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-900 mb-2">COORDENADAS (Opcional)</label>
                            <div class="grid grid-cols-2 gap-4">
                                <input type="text" id="latitude" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Latitud">
                                <input type="text" id="longitude" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Longitud">
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Section 2: Detalles de la Propiedad (Expandable) -->
                <div class="mb-6 border border-gray-200 rounded-lg">
                    <button type="button" class="w-full p-4 bg-gray-50 hover:bg-blue-50 flex justify-between items-center transition-colors" onclick="toggleSection('details-section')">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                🏠
                            </div>
                            <div class="text-left">
                                <h4 class="text-lg font-bold text-gray-900">Detalles de la Propiedad</h4>
                                <p class="text-sm text-gray-600">Área, habitaciones, año de construcción</p>
                            </div>
                        </div>
                        <div class="transform transition-transform" id="details-arrow">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>
                    <div id="details-section" class="hidden p-6 space-y-4 bg-white">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">ÁREA TOTAL (m²) *</label>
                                <input type="number" id="totalArea" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Metros cuadrados">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">ÁREA CONSTRUIDA (m²) *</label>
                                <input type="number" id="constructionArea" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Metros cuadrados construidos">
                            </div>
                        </div>
                        <div class="grid md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">HABITACIONES</label>
                                <input type="number" id="bedrooms" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="0">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">BAÑOS</label>
                                <input type="number" id="bathrooms" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="0">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">AÑO CONSTRUCCIÓN</label>
                                <input type="number" id="constructionYear" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="2020">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-900 mb-2">CONDICIÓN DE LA PROPIEDAD</label>
                            <select id="condition" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors">
                                <option value="excellent">Excelente (Excellent)</option>
                                <option value="good">Buena (Good)</option>
                                <option value="fair">Regular (Fair)</option>
                                <option value="needs_work">Necesita Trabajo (Needs Work)</option>
                                <option value="new_construction">Nueva Construcción (New Construction)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Información Financiera (Expandable) -->
                <div class="mb-6 border border-gray-200 rounded-lg">
                    <button type="button" class="w-full p-4 bg-gray-50 hover:bg-blue-50 flex justify-between items-center transition-colors" onclick="toggleSection('financial-section')">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                💰
                            </div>
                            <div class="text-left">
                                <h4 class="text-lg font-bold text-gray-900">Información Financiera</h4>
                                <p class="text-sm text-gray-600">Valor estimado, ingresos y tipo de tokenización</p>
                            </div>
                        </div>
                        <div class="transform transition-transform" id="financial-arrow">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>
                    <div id="financial-section" class="hidden p-6 space-y-4 bg-white">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">VALOR ESTIMADO (USD) *</label>
                                <input type="number" id="estimatedValue" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="75000">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">INGRESO MENSUAL ALQUILER (USD)</label>
                                <input type="number" id="monthlyRent" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-900 mb-2">TIPO DE TOKENIZACIÓN *</label>
                            <select id="tokenizationType" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors">
                                <option value="fractional">Acciones Fraccionarias (Múltiples Inversionistas)</option>
                                <option value="whole">NFT de Propiedad Completa (Un Solo Comprador)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 4: RGP Information (Expandable) -->
                <div class="mb-8 border border-gray-200 rounded-lg">
                    <button type="button" class="w-full p-4 bg-gray-50 hover:bg-blue-50 flex justify-between items-center transition-colors" onclick="toggleSection('rgp-section')">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                📋
                            </div>
                            <div class="text-left">
                                <h4 class="text-lg font-bold text-gray-900">Información RGP</h4>
                                <p class="text-sm text-gray-600">Números de finca y folio (si están disponibles)</p>
                            </div>
                        </div>
                        <div class="transform transition-transform" id="rgp-arrow">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </button>
                    <div id="rgp-section" class="hidden p-6 space-y-4 bg-white">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">NÚMERO DE FINCA RGP</label>
                                <input type="text" id="rgpFinca" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Opcional">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-900 mb-2">NÚMERO DE FOLIO RGP</label>
                                <input type="text" id="rgpFolio" class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors" placeholder="Opcional">
                            </div>
                        </div>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="text-sm text-blue-800">
                                <strong>Nota:</strong> Los números RGP se pueden obtener más tarde si no los tienes disponibles ahora.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                    <button onclick="closeModal()" class="px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors">
                        CANCELAR
                    </button>
                    <button onclick="startTokenization()" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 rounded-lg transition-colors shadow-lg">
                        INICIAR PROCESO DE TOKENIZACIÓN
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-expand first section
    setTimeout(() => {
        toggleSection('location-section');
    }, 100);
}

// Toggle expandable sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(sectionId.replace('-section', '-arrow'));
    
    if (section && arrow) {
        section.classList.toggle('hidden');
        
        if (section.classList.contains('hidden')) {
            arrow.classList.remove('rotate-180');
        } else {
            arrow.classList.add('rotate-180');
        }
    }
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Start tokenization process
async function startTokenization() {
    // Collect all form data
    const propertyData = {
        walletAddress,
        // Basic Information
        propertyType: document.getElementById('propertyType').value,
        department: document.getElementById('department').value,
        municipality: document.getElementById('municipality').value,
        address: document.getElementById('address').value,
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value,
        
        // Property Details
        totalArea: document.getElementById('totalArea').value,
        constructionArea: document.getElementById('constructionArea').value,
        bedrooms: document.getElementById('bedrooms').value,
        bathrooms: document.getElementById('bathrooms').value,
        constructionYear: document.getElementById('constructionYear').value,
        estimatedValue: parseInt(document.getElementById('estimatedValue').value),
        monthlyRent: document.getElementById('monthlyRent').value,
        condition: document.getElementById('condition').value,
        tokenizationType: document.getElementById('tokenizationType').value,
        
        // RGP Information
        rgpFinca: document.getElementById('rgpFinca').value,
        rgpFolio: document.getElementById('rgpFolio').value,
        
        // Status tracking
        status: 'pending_documents',
        documentsUploaded: false,
        notaryVerified: false,
        contractDeployed: false,
        arweaveLinks: {},
        createdAt: new Date()
    };
    
    // Validate required fields
    if (!propertyData.propertyType || !propertyData.department || 
        !propertyData.municipality || !propertyData.address || 
        !propertyData.estimatedValue || !propertyData.totalArea) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        // Send to backend API
        const response = await fetch('http://localhost:3001/api/tokenize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Property details saved! Next: Upload documents to Arweave', 'success');
            closeModal();
            
            // Show document upload flow
            setTimeout(() => {
                showDocumentUpload(result.data.id);
            }, 2000);
        } else {
            throw new Error('Failed to start tokenization');
        }
    } catch (error) {
        console.error('Tokenization error:', error);
        showNotification('Failed to start tokenization process', 'error');
    }
}

// Show document upload
function showDocumentUpload(propertyId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-12 max-w-3xl mx-4 border border-gray-200">
            <h2 class="text-3xl font-black mb-8 text-black">UPLOAD DOCUMENTS</h2>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="font-bold text-black mb-4">REQUIRED DOCUMENTS:</h3>
                    <ul class="text-sm text-gray-600 space-y-2">
                        <li>• Título de Propiedad (Property Title)</li>
                        <li>• RGP Certification</li>
                        <li>• Property Photos</li>
                        <li>• Municipal Permits</li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-black mb-4">NEXT STEPS:</h3>
                    <ul class="text-sm text-gray-600 space-y-2">
                        <li>• Documents verified by notary</li>
                        <li>• Smart contract deployed</li>
                        <li>• Property listed for investment</li>
                        <li>• Revenue sharing begins</li>
                    </ul>
                </div>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-black mb-2">TÍTULO DE PROPIEDAD (Property Title) - REQUIRED</label>
                    <input type="file" id="propertyTitle" class="w-full p-4 border border-gray-200" accept=".pdf,.jpg,.png">
                    <p class="text-xs text-gray-500 mt-1">Original property title document from RGP</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-black mb-2">RGP CERTIFICATION - REQUIRED</label>
                    <input type="file" id="rgpCert" class="w-full p-4 border border-gray-200" accept=".pdf,.jpg,.png">
                    <p class="text-xs text-gray-500 mt-1">Recent RGP certificate proving current ownership</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-black mb-2">PROPERTY PHOTOS - REQUIRED</label>
                    <input type="file" id="propertyPhotos" class="w-full p-4 border border-gray-200" accept=".jpg,.png" multiple>
                    <p class="text-xs text-gray-500 mt-1">High-quality photos showing exterior, interior, and key features</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-black mb-2">MUNICIPAL PERMITS (Optional)</label>
                    <input type="file" id="municipalPermits" class="w-full p-4 border border-gray-200" accept=".pdf,.jpg,.png" multiple>
                    <p class="text-xs text-gray-500 mt-1">Construction permits, occupancy certificates, etc.</p>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-black mb-2">RENTAL AGREEMENTS (Optional)</label>
                    <input type="file" id="rentalAgreements" class="w-full p-4 border border-gray-200" accept=".pdf" multiple>
                    <p class="text-xs text-gray-500 mt-1">Current rental contracts if property generates income</p>
                </div>
            </div>
            
            <div class="bg-gray-50 p-6 border border-gray-200 mt-8">
                <h4 class="font-black text-black mb-2">ARWEAVE PERMANENT STORAGE</h4>
                <p class="text-sm text-gray-600">All documents will be permanently stored on Arweave decentralized network. This ensures your property documents can never be lost, altered, or censored. Storage cost: ~$0.50 per document.</p>
            </div>
            
            <div class="flex justify-between mt-12">
                <button onclick="closeModal()" class="px-8 py-4 border border-gray-400 text-gray-600 font-bold hover:bg-gray-50">
                    CANCEL
                </button>
                <button onclick="uploadDocuments('${propertyId}')" class="px-8 py-4 bg-black text-white font-bold hover:bg-gray-900">
                    UPLOAD TO ARWEAVE & START VERIFICATION
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Upload documents
async function uploadDocuments(propertyId) {
    // Check required files
    const propertyTitle = document.getElementById('propertyTitle').files[0];
    const rgpCert = document.getElementById('rgpCert').files[0];
    const propertyPhotos = document.getElementById('propertyPhotos').files;
    
    if (!propertyTitle || !rgpCert || propertyPhotos.length === 0) {
        showNotification('Please upload all required documents', 'error');
        return;
    }
    
    showNotification('Uploading documents to Arweave...', 'info');
    closeModal();
    
    try {
        // Simulate Arweave uploads with realistic delays
        const arweaveLinks = {};
        
        // Upload property title
        await new Promise(resolve => setTimeout(resolve, 2000));
        arweaveLinks.propertyTitle = `ar://${generateRandomHash()}`;
        showNotification('Property title uploaded to Arweave ✓', 'success');
        
        // Upload RGP certification
        await new Promise(resolve => setTimeout(resolve, 1500));
        arweaveLinks.rgpCertification = `ar://${generateRandomHash()}`;
        showNotification('RGP certification uploaded to Arweave ✓', 'success');
        
        // Upload photos
        arweaveLinks.photos = [];
        for (let i = 0; i < propertyPhotos.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            arweaveLinks.photos.push(`ar://${generateRandomHash()}`);
            showNotification(`Photo ${i + 1}/${propertyPhotos.length} uploaded ✓`, 'success');
        }
        
        // Upload optional documents
        const municipalPermits = document.getElementById('municipalPermits').files;
        if (municipalPermits.length > 0) {
            arweaveLinks.municipalPermits = [];
            for (let i = 0; i < municipalPermits.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                arweaveLinks.municipalPermits.push(`ar://${generateRandomHash()}`);
            }
            showNotification('Municipal permits uploaded ✓', 'success');
        }
        
        const rentalAgreements = document.getElementById('rentalAgreements').files;
        if (rentalAgreements.length > 0) {
            arweaveLinks.rentalAgreements = [];
            for (let i = 0; i < rentalAgreements.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                arweaveLinks.rentalAgreements.push(`ar://${generateRandomHash()}`);
            }
            showNotification('Rental agreements uploaded ✓', 'success');
        }
        
        // Update property record with Arweave links
        const response = await fetch(`http://localhost:3001/api/tokenize/${propertyId}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                arweaveLinks,
                documentsUploaded: true,
                status: 'pending_notary_verification'
            })
        });
        
        if (response.ok) {
            showNotification('All documents stored permanently on Arweave! 🎉', 'success');
            
            // Show next steps
            setTimeout(() => {
                showNotaryVerification(propertyId, arweaveLinks);
            }, 3000);
        } else {
            throw new Error('Failed to update property record');
        }
        
    } catch (error) {
        console.error('Document upload error:', error);
        showNotification('Failed to upload documents. Please try again.', 'error');
    }
}

// Generate random Arweave-like hash
function generateRandomHash() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 43; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Show notary verification process
function showNotaryVerification(propertyId, arweaveLinks) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-12 max-w-4xl mx-4 border border-gray-200">
            <h2 class="text-3xl font-black mb-4 text-black">NOTARY VERIFICATION IN PROGRESS</h2>
            <h3 class="text-xl font-black mb-8 text-gray-600">VERIFICACIÓN NOTARIAL EN PROCESO</h3>
            
            <div class="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 class="text-lg font-black text-black mb-4">DOCUMENTS ON ARWEAVE:</h4>
                    <div class="space-y-2 text-sm">
                        <p><strong>Property Title:</strong> <a href="#" class="text-blue-600">${arweaveLinks.propertyTitle}</a></p>
                        <p><strong>RGP Certification:</strong> <a href="#" class="text-blue-600">${arweaveLinks.rgpCertification}</a></p>
                        <p><strong>Photos:</strong> ${arweaveLinks.photos.length} files permanently stored</p>
                        ${arweaveLinks.municipalPermits ? `<p><strong>Municipal Permits:</strong> ${arweaveLinks.municipalPermits.length} files</p>` : ''}
                        ${arweaveLinks.rentalAgreements ? `<p><strong>Rental Agreements:</strong> ${arweaveLinks.rentalAgreements.length} files</p>` : ''}
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-black text-black mb-4">NEXT STEPS:</h4>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-6 h-6 bg-black text-white flex items-center justify-center text-xs">✓</div>
                            <span class="text-sm">Documents uploaded to Arweave</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-6 h-6 bg-gray-400 text-white flex items-center justify-center text-xs animate-pulse">2</div>
                            <span class="text-sm">Notary verification (24-48 hours)</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-6 h-6 bg-gray-300 text-white flex items-center justify-center text-xs">3</div>
                            <span class="text-sm text-gray-500">Smart contract deployment</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-6 h-6 bg-gray-300 text-white flex items-center justify-center text-xs">4</div>
                            <span class="text-sm text-gray-500">Property goes live for investment</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 p-6 border border-gray-200">
                <h4 class="font-black text-black mb-2">WHAT HAPPENS NEXT?</h4>
                <p class="text-sm text-gray-600">
                    A certified Guatemala notary will review your documents and verify the property details. 
                    You'll receive email updates on the verification status. Once approved, your property 
                    will be tokenized and made available for investment.
                </p>
            </div>
            
            <div class="text-center mt-12">
                <button onclick="closeModal()" class="px-12 py-4 bg-black text-white font-bold hover:bg-gray-900">
                    UNDERSTOOD - WAIT FOR VERIFICATION
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Setup language toggle
function setupLanguageToggle() {
    // Add language toggle to navigation
    const nav = document.querySelector('nav .hidden');
    if (nav) {
        const langToggle = document.createElement('button');
        langToggle.className = 'text-gray-500 hover:text-black font-semibold';
        langToggle.textContent = 'ES';
        langToggle.addEventListener('click', toggleLanguage);
        langToggle.style.marginLeft = '20px';
        nav.appendChild(langToggle);
        console.log('Language toggle added to navigation');
    } else {
        console.log('Navigation not found for language toggle');
    }
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    console.log('Language toggled to:', currentLanguage);
    
    // Save language preference
    localStorage.setItem('propi-language', currentLanguage);
    
    // Update language toggle button
    const langButtons = document.querySelectorAll('button');
    langButtons.forEach(btn => {
        if (btn.textContent === 'EN' || btn.textContent === 'ES') {
            btn.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
        }
    });
    
    // Apply translations
    applyTranslations();
}

// Apply translations to page
function applyTranslations() {
    // Translate all text elements
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, button, a, span, div, li');
    
    elements.forEach(element => {
        // Skip if element has child elements (to avoid double translation)
        if (element.children.length > 0) return;
        
        const text = element.textContent.trim();
        if (text && translations[currentLanguage] && translations[currentLanguage][text]) {
            element.textContent = translations[currentLanguage][text];
        }
        
        // Also check for partial matches in longer text
        if (text.length > 50) {
            let translatedText = text;
            Object.keys(translations[currentLanguage]).forEach(key => {
                if (text.includes(key)) {
                    translatedText = translatedText.replace(key, translations[currentLanguage][key]);
                }
            });
            if (translatedText !== text) {
                element.textContent = translatedText;
            }
        }
        
        // Handle HTML content with <br> tags
        if (element.innerHTML.includes('<br>')) {
            let htmlContent = element.innerHTML;
            Object.keys(translations[currentLanguage]).forEach(key => {
                if (htmlContent.includes(key)) {
                    htmlContent = htmlContent.replace(new RegExp(key, 'g'), translations[currentLanguage][key]);
                }
            });
            if (htmlContent !== element.innerHTML) {
                element.innerHTML = htmlContent;
            }
        }
    });
    
    // Update placeholder text in inputs
    document.querySelectorAll('input, textarea').forEach(element => {
        const placeholder = element.getAttribute('placeholder');
        if (placeholder && translations[currentLanguage] && translations[currentLanguage][placeholder]) {
            element.setAttribute('placeholder', translations[currentLanguage][placeholder]);
        }
    });
    
    // Update navigation active states based on current page
    updateNavigationActiveStates();
}

// Update navigation active states for current language
function updateNavigationActiveStates() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('text-black', 'font-semibold');
        link.classList.add('text-gray-500', 'hover:text-black', 'font-semibold');
        
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            link.classList.remove('text-gray-500', 'hover:text-black');
            link.classList.add('text-black');
        }
    });
}

// Check existing wallet connection
async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                walletAddress = accounts[0];
                isWalletConnected = true;
                updateWalletButtons();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 border ${
        type === 'success' ? 'bg-gray-50 border-gray-200 text-black' : 
        type === 'error' ? 'bg-gray-100 border-gray-300 text-black' : 
        'bg-white border-gray-200 text-black'
    } z-50 font-semibold`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}