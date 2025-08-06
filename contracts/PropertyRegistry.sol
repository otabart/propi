// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PropertyRegistry
 * @dev Main contract for tokenizing whole properties in Guatemala
 * Each NFT represents complete ownership of a property
 */
contract PropertyRegistry is ERC721URIStorage, AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant NOTARY_ROLE = keccak256("NOTARY");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    
    // Token ID counter
    uint256 private _tokenIdCounter;
    
    // Property structure
    struct Property {
        string registryNumber;      // RGP folio number
        string cadastralReference;  // Referencia catastral
        string municipality;        // Municipality in Guatemala
        string zone;               // Zone number
        uint256 areaSqMeters;      // Area in square meters
        uint256 constructionSqMeters; // Construction area
        PropertyType propertyType;
        address currentOwner;
        string documentIPFSHash;   // IPFS hash of legal documents
        string imageIPFSHash;      // IPFS hash of property images
        uint256 valuationUSD;      // Property valuation in USD
        uint256 valuationGTQ;      // Property valuation in Quetzales
        bool isVerified;           // Verified by notary
        bool hasEncumbrance;       // Has liens or encumbrances
        uint256 tokenizationDate;
        uint256 lastTransferDate;
        address verifyingNotary;
    }
    
    // Property types
    enum PropertyType {
        Residential,
        Commercial,
        Industrial,
        Agricultural,
        Mixed
    }
    
    // Transfer request structure for 2-step transfers
    struct TransferRequest {
        address from;
        address to;
        uint256 tokenId;
        uint256 requestTime;
        bool notaryApproved;
        bool registryApproved;
        string transferDocumentHash;
    }
    
    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(string => uint256) public registryNumberToTokenId;
    mapping(uint256 => TransferRequest) public pendingTransfers;
    mapping(address => uint256[]) public ownerProperties;
    mapping(address => bool) public verifiedNotaries;
    
    // Fee structure
    uint256 public tokenizationFeeUSD = 100; // Base fee in USD
    uint256 public transferFeePercent = 50; // 0.5% = 50 basis points
    address public feeRecipient;
    
    // Events
    event PropertyTokenized(
        uint256 indexed tokenId,
        string registryNumber,
        address indexed owner,
        uint256 valuationUSD
    );
    
    event TransferRequested(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 requestTime
    );
    
    event TransferApproved(
        uint256 indexed tokenId,
        address approver,
        string role
    );
    
    event TransferCompleted(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 transferTime
    );
    
    event PropertyVerified(
        uint256 indexed tokenId,
        address indexed notary,
        uint256 verificationTime
    );
    
    event PropertyValuationUpdated(
        uint256 indexed tokenId,
        uint256 oldValueUSD,
        uint256 newValueUSD
    );
    
    constructor(address _feeRecipient) ERC721("Propius Property Token", "PPT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Tokenize a new property
     * Only verified notaries can call this function
     */
    function tokenizeProperty(
        string memory _registryNumber,
        string memory _cadastralReference,
        string memory _municipality,
        string memory _zone,
        uint256 _areaSqMeters,
        uint256 _constructionSqMeters,
        PropertyType _propertyType,
        address _owner,
        string memory _documentIPFSHash,
        uint256 _valuationUSD,
        uint256 _valuationGTQ
    ) external onlyRole(NOTARY_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_registryNumber).length > 0, "Invalid registry number");
        require(_owner != address(0), "Invalid owner address");
        require(registryNumberToTokenId[_registryNumber] == 0, "Property already tokenized");
        require(_areaSqMeters > 0, "Invalid area");
        require(_valuationUSD > 0, "Invalid valuation");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Create property record
        Property storage newProperty = properties[tokenId];
        newProperty.registryNumber = _registryNumber;
        newProperty.cadastralReference = _cadastralReference;
        newProperty.municipality = _municipality;
        newProperty.zone = _zone;
        newProperty.areaSqMeters = _areaSqMeters;
        newProperty.constructionSqMeters = _constructionSqMeters;
        newProperty.propertyType = _propertyType;
        newProperty.currentOwner = _owner;
        newProperty.documentIPFSHash = _documentIPFSHash;
        newProperty.valuationUSD = _valuationUSD;
        newProperty.valuationGTQ = _valuationGTQ;
        newProperty.isVerified = true;
        newProperty.tokenizationDate = block.timestamp;
        newProperty.lastTransferDate = block.timestamp;
        newProperty.verifyingNotary = msg.sender;
        
        // Update mappings
        registryNumberToTokenId[_registryNumber] = tokenId;
        ownerProperties[_owner].push(tokenId);
        
        // Mint NFT
        _safeMint(_owner, tokenId);
        _setTokenURI(tokenId, _documentIPFSHash);
        
        emit PropertyTokenized(tokenId, _registryNumber, _owner, _valuationUSD);
        emit PropertyVerified(tokenId, msg.sender, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Request a property transfer (requires notary and registry approval)
     */
    function requestTransfer(
        uint256 _tokenId,
        address _to,
        string memory _transferDocumentHash
    ) external nonReentrant {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid recipient");
        require(_to != msg.sender, "Cannot transfer to self");
        require(pendingTransfers[_tokenId].requestTime == 0, "Transfer already pending");
        
        pendingTransfers[_tokenId] = TransferRequest({
            from: msg.sender,
            to: _to,
            tokenId: _tokenId,
            requestTime: block.timestamp,
            notaryApproved: false,
            registryApproved: false,
            transferDocumentHash: _transferDocumentHash
        });
        
        emit TransferRequested(_tokenId, msg.sender, _to, block.timestamp);
    }
    
    /**
     * @dev Approve a pending transfer (by notary)
     */
    function approveTransferAsNotary(uint256 _tokenId) external onlyRole(NOTARY_ROLE) {
        require(pendingTransfers[_tokenId].requestTime > 0, "No pending transfer");
        require(!pendingTransfers[_tokenId].notaryApproved, "Already approved by notary");
        
        pendingTransfers[_tokenId].notaryApproved = true;
        
        emit TransferApproved(_tokenId, msg.sender, "NOTARY");
        
        // Execute transfer if both approvals received
        _checkAndExecuteTransfer(_tokenId);
    }
    
    /**
     * @dev Approve a pending transfer (by registry)
     */
    function approveTransferAsRegistry(uint256 _tokenId) external onlyRole(REGISTRY_ROLE) {
        require(pendingTransfers[_tokenId].requestTime > 0, "No pending transfer");
        require(!pendingTransfers[_tokenId].registryApproved, "Already approved by registry");
        
        pendingTransfers[_tokenId].registryApproved = true;
        
        emit TransferApproved(_tokenId, msg.sender, "REGISTRY");
        
        // Execute transfer if both approvals received
        _checkAndExecuteTransfer(_tokenId);
    }
    
    /**
     * @dev Internal function to execute transfer if approved
     */
    function _checkAndExecuteTransfer(uint256 _tokenId) private {
        TransferRequest memory transfer = pendingTransfers[_tokenId];
        
        if (transfer.notaryApproved && transfer.registryApproved) {
            // Update property owner
            properties[_tokenId].currentOwner = transfer.to;
            properties[_tokenId].lastTransferDate = block.timestamp;
            
            // Update owner properties mapping
            _removeFromOwnerProperties(transfer.from, _tokenId);
            ownerProperties[transfer.to].push(_tokenId);
            
            // Execute NFT transfer
            _safeTransfer(transfer.from, transfer.to, _tokenId, "");
            
            // Clear pending transfer
            delete pendingTransfers[_tokenId];
            
            emit TransferCompleted(_tokenId, transfer.from, transfer.to, block.timestamp);
        }
    }
    
    /**
     * @dev Update property valuation
     */
    function updateValuation(
        uint256 _tokenId,
        uint256 _newValuationUSD,
        uint256 _newValuationGTQ
    ) external onlyRole(NOTARY_ROLE) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        require(_newValuationUSD > 0, "Invalid valuation");
        
        uint256 oldValue = properties[_tokenId].valuationUSD;
        properties[_tokenId].valuationUSD = _newValuationUSD;
        properties[_tokenId].valuationGTQ = _newValuationGTQ;
        
        emit PropertyValuationUpdated(_tokenId, oldValue, _newValuationUSD);
    }
    
    /**
     * @dev Add or update property images
     */
    function updatePropertyImages(
        uint256 _tokenId,
        string memory _imageIPFSHash
    ) external {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        properties[_tokenId].imageIPFSHash = _imageIPFSHash;
    }
    
    /**
     * @dev Update encumbrance status
     */
    function updateEncumbrance(
        uint256 _tokenId,
        bool _hasEncumbrance
    ) external onlyRole(REGISTRY_ROLE) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        properties[_tokenId].hasEncumbrance = _hasEncumbrance;
    }
    
    /**
     * @dev Get property details
     */
    function getProperty(uint256 _tokenId) external view returns (Property memory) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return properties[_tokenId];
    }
    
    /**
     * @dev Get all properties owned by an address
     */
    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }
    
    /**
     * @dev Cancel a pending transfer
     */
    function cancelTransfer(uint256 _tokenId) external {
        require(pendingTransfers[_tokenId].from == msg.sender, "Not the requester");
        require(pendingTransfers[_tokenId].requestTime > 0, "No pending transfer");
        
        delete pendingTransfers[_tokenId];
    }
    
    /**
     * @dev Add verified notary
     */
    function addVerifiedNotary(address _notary) external onlyRole(ADMIN_ROLE) {
        require(_notary != address(0), "Invalid address");
        verifiedNotaries[_notary] = true;
        _grantRole(NOTARY_ROLE, _notary);
    }
    
    /**
     * @dev Remove verified notary
     */
    function removeVerifiedNotary(address _notary) external onlyRole(ADMIN_ROLE) {
        verifiedNotaries[_notary] = false;
        _revokeRole(NOTARY_ROLE, _notary);
    }
    
    /**
     * @dev Update fee structure
     */
    function updateFees(
        uint256 _tokenizationFeeUSD,
        uint256 _transferFeePercent
    ) external onlyRole(ADMIN_ROLE) {
        require(_transferFeePercent <= 200, "Fee too high"); // Max 2%
        tokenizationFeeUSD = _tokenizationFeeUSD;
        transferFeePercent = _transferFeePercent;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Remove token from owner's property list
     */
    function _removeFromOwnerProperties(address _owner, uint256 _tokenId) private {
        uint256[] storage props = ownerProperties[_owner];
        for (uint256 i = 0; i < props.length; i++) {
            if (props[i] == _tokenId) {
                props[i] = props[props.length - 1];
                props.pop();
                break;
            }
        }
    }
    
    
    /**
     * @dev Required override for Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}