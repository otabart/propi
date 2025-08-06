// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FractionalProperty
 * @dev Contract for fractionalizing properties into tradeable shares
 * Enables partial ownership and automated revenue distribution
 */
contract FractionalProperty is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR");
    
    // Asset ID counter
    uint256 private _assetIdCounter;
    
    // Fractional asset structure
    struct FractionalAsset {
        uint256 propertyTokenId;     // Reference to PropertyRegistry NFT
        address propertyRegistry;    // PropertyRegistry contract address
        string propertyIdentifier;   // RGP number or unique ID
        uint256 totalShares;        // Total number of shares
        uint256 availableShares;    // Shares available for sale
        uint256 sharePriceUSD;      // Price per share in USD (6 decimals)
        uint256 minimumInvestment;  // Minimum shares to purchase
        address paymentToken;       // USDC or other stablecoin address
        address beneficiary;        // Who receives the sale proceeds
        bool isActive;              // Whether shares can be purchased
        bool revenueGenerating;     // Whether property generates revenue
        uint256 totalRevenue;       // Total revenue distributed to date
        uint256 createdAt;
        string metadataURI;         // IPFS URI for additional metadata
    }
    
    // Revenue distribution structure
    struct RevenueDistribution {
        uint256 assetId;
        uint256 totalAmount;
        uint256 perShareAmount;
        uint256 distributionDate;
        address distributedBy;
        string description;
    }
    
    // Investor structure
    struct InvestorInfo {
        uint256 totalInvested;
        uint256 totalRevenueReceived;
        uint256[] ownedAssets;
    }
    
    // Mappings
    mapping(uint256 => FractionalAsset) public fractionalAssets;
    mapping(uint256 => mapping(address => uint256)) public shareholdings;
    mapping(uint256 => uint256) public totalSharesSold;
    mapping(uint256 => RevenueDistribution[]) public revenueHistory;
    mapping(address => InvestorInfo) public investors;
    mapping(uint256 => mapping(address => uint256)) public unclaimedRevenue;
    mapping(uint256 => address[]) public assetHolders;
    mapping(uint256 => mapping(address => bool)) public isHolder;
    
    // Platform fee
    uint256 public platformFeePercent = 250; // 2.5% = 250 basis points
    address public feeRecipient;
    
    // Events
    event AssetFractionalized(
        uint256 indexed assetId,
        uint256 propertyTokenId,
        uint256 totalShares,
        uint256 sharePriceUSD
    );
    
    event SharesPurchased(
        uint256 indexed assetId,
        address indexed buyer,
        uint256 shares,
        uint256 totalCost
    );
    
    event RevenueDistributed(
        uint256 indexed assetId,
        uint256 totalAmount,
        uint256 perShareAmount,
        string description
    );
    
    event RevenueClaimed(
        uint256 indexed assetId,
        address indexed investor,
        uint256 amount
    );
    
    event AssetStatusUpdated(
        uint256 indexed assetId,
        bool isActive
    );
    
    constructor(address _feeRecipient, string memory _uri) ERC1155(_uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Fractionalize a property into shares
     */
    function fractionalizeProperty(
        uint256 _propertyTokenId,
        address _propertyRegistry,
        string memory _propertyIdentifier,
        uint256 _totalShares,
        uint256 _sharePriceUSD,
        uint256 _minimumInvestment,
        address _paymentToken,
        address _beneficiary,
        bool _revenueGenerating,
        string memory _metadataURI
    ) external onlyRole(PROPERTY_MANAGER_ROLE) whenNotPaused returns (uint256) {
        require(_totalShares > 0, "Invalid share count");
        require(_sharePriceUSD > 0, "Invalid share price");
        require(_minimumInvestment > 0 && _minimumInvestment <= _totalShares, "Invalid minimum investment");
        require(_paymentToken != address(0), "Invalid payment token");
        require(_beneficiary != address(0), "Invalid beneficiary");
        
        _assetIdCounter++;
        uint256 assetId = _assetIdCounter;
        
        fractionalAssets[assetId] = FractionalAsset({
            propertyTokenId: _propertyTokenId,
            propertyRegistry: _propertyRegistry,
            propertyIdentifier: _propertyIdentifier,
            totalShares: _totalShares,
            availableShares: _totalShares,
            sharePriceUSD: _sharePriceUSD,
            minimumInvestment: _minimumInvestment,
            paymentToken: _paymentToken,
            beneficiary: _beneficiary,
            isActive: true,
            revenueGenerating: _revenueGenerating,
            totalRevenue: 0,
            createdAt: block.timestamp,
            metadataURI: _metadataURI
        });
        
        emit AssetFractionalized(assetId, _propertyTokenId, _totalShares, _sharePriceUSD);
        
        return assetId;
    }
    
    /**
     * @dev Purchase shares of a fractionalized property
     */
    function purchaseShares(
        uint256 _assetId,
        uint256 _shares
    ) external nonReentrant whenNotPaused {
        FractionalAsset storage asset = fractionalAssets[_assetId];
        
        require(asset.isActive, "Asset not active");
        require(_shares >= asset.minimumInvestment, "Below minimum investment");
        require(_shares <= asset.availableShares, "Insufficient shares available");
        
        uint256 totalCost = (_shares * asset.sharePriceUSD) / 1e6; // Adjust for 6 decimal places
        uint256 platformFee = (totalCost * platformFeePercent) / 10000;
        uint256 beneficiaryAmount = totalCost - platformFee;
        
        // Transfer payment
        IERC20 paymentToken = IERC20(asset.paymentToken);
        require(paymentToken.transferFrom(msg.sender, feeRecipient, platformFee), "Fee transfer failed");
        require(paymentToken.transferFrom(msg.sender, asset.beneficiary, beneficiaryAmount), "Payment transfer failed");
        
        // Update shareholdings
        shareholdings[_assetId][msg.sender] += _shares;
        totalSharesSold[_assetId] += _shares;
        asset.availableShares -= _shares;
        
        // Update investor info
        if (!isHolder[_assetId][msg.sender]) {
            assetHolders[_assetId].push(msg.sender);
            isHolder[_assetId][msg.sender] = true;
            investors[msg.sender].ownedAssets.push(_assetId);
        }
        investors[msg.sender].totalInvested += totalCost;
        
        // Mint ERC1155 tokens
        _mint(msg.sender, _assetId, _shares, "");
        
        emit SharesPurchased(_assetId, msg.sender, _shares, totalCost);
        
        // Deactivate if sold out
        if (asset.availableShares == 0) {
            asset.isActive = false;
            emit AssetStatusUpdated(_assetId, false);
        }
    }
    
    /**
     * @dev Distribute revenue to shareholders
     */
    function distributeRevenue(
        uint256 _assetId,
        uint256 _amount,
        string memory _description
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        FractionalAsset storage asset = fractionalAssets[_assetId];
        require(asset.revenueGenerating, "Not a revenue generating asset");
        require(totalSharesSold[_assetId] > 0, "No shares sold");
        
        IERC20 paymentToken = IERC20(asset.paymentToken);
        require(paymentToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        uint256 perShareAmount = _amount / totalSharesSold[_assetId];
        
        // Record distribution
        revenueHistory[_assetId].push(RevenueDistribution({
            assetId: _assetId,
            totalAmount: _amount,
            perShareAmount: perShareAmount,
            distributionDate: block.timestamp,
            distributedBy: msg.sender,
            description: _description
        }));
        
        // Allocate revenue to holders
        address[] memory holders = assetHolders[_assetId];
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 shares = shareholdings[_assetId][holder];
            if (shares > 0) {
                uint256 holderRevenue = shares * perShareAmount;
                unclaimedRevenue[_assetId][holder] += holderRevenue;
                investors[holder].totalRevenueReceived += holderRevenue;
            }
        }
        
        asset.totalRevenue += _amount;
        
        emit RevenueDistributed(_assetId, _amount, perShareAmount, _description);
    }
    
    /**
     * @dev Claim accumulated revenue
     */
    function claimRevenue(uint256 _assetId) external nonReentrant {
        uint256 claimable = unclaimedRevenue[_assetId][msg.sender];
        require(claimable > 0, "No revenue to claim");
        
        FractionalAsset memory asset = fractionalAssets[_assetId];
        unclaimedRevenue[_assetId][msg.sender] = 0;
        
        IERC20 paymentToken = IERC20(asset.paymentToken);
        require(paymentToken.transfer(msg.sender, claimable), "Transfer failed");
        
        emit RevenueClaimed(_assetId, msg.sender, claimable);
    }
    
    /**
     * @dev Claim revenue from multiple assets
     */
    function claimMultipleRevenue(uint256[] calldata _assetIds) external nonReentrant {
        for (uint256 i = 0; i < _assetIds.length; i++) {
            uint256 assetId = _assetIds[i];
            uint256 claimable = unclaimedRevenue[assetId][msg.sender];
            
            if (claimable > 0) {
                FractionalAsset memory asset = fractionalAssets[assetId];
                unclaimedRevenue[assetId][msg.sender] = 0;
                
                IERC20 paymentToken = IERC20(asset.paymentToken);
                require(paymentToken.transfer(msg.sender, claimable), "Transfer failed");
                
                emit RevenueClaimed(assetId, msg.sender, claimable);
            }
        }
    }
    
    /**
     * @dev Get claimable revenue for an investor
     */
    function getClaimableRevenue(address _investor, uint256 _assetId) external view returns (uint256) {
        return unclaimedRevenue[_assetId][_investor];
    }
    
    /**
     * @dev Get all assets owned by an investor
     */
    function getInvestorAssets(address _investor) external view returns (uint256[] memory) {
        return investors[_investor].ownedAssets;
    }
    
    /**
     * @dev Get revenue history for an asset
     */
    function getRevenueHistory(uint256 _assetId) external view returns (RevenueDistribution[] memory) {
        return revenueHistory[_assetId];
    }
    
    /**
     * @dev Get all holders of an asset
     */
    function getAssetHolders(uint256 _assetId) external view returns (address[] memory) {
        return assetHolders[_assetId];
    }
    
    /**
     * @dev Update asset status
     */
    function updateAssetStatus(uint256 _assetId, bool _isActive) external onlyRole(PROPERTY_MANAGER_ROLE) {
        fractionalAssets[_assetId].isActive = _isActive;
        emit AssetStatusUpdated(_assetId, _isActive);
    }
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _feePercent) external onlyRole(ADMIN_ROLE) {
        require(_feePercent <= 500, "Fee too high"); // Max 5%
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Update fee recipient
     */
    function updateFeeRecipient(address _newRecipient) external onlyRole(ADMIN_ROLE) {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
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
     * @dev Override for pausable transfers
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override whenNotPaused {
        super._update(from, to, ids, amounts);
        
        // Update holder mappings on transfer
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 assetId = ids[i];
            uint256 amount = amounts[i];
            
            if (from != address(0)) {
                shareholdings[assetId][from] -= amount;
                if (shareholdings[assetId][from] == 0) {
                    isHolder[assetId][from] = false;
                    // Remove from holders array (gas intensive, consider alternative)
                }
            }
            
            if (to != address(0)) {
                shareholdings[assetId][to] += amount;
                if (!isHolder[assetId][to]) {
                    assetHolders[assetId].push(to);
                    isHolder[assetId][to] = true;
                }
            }
        }
    }
    
    /**
     * @dev Required override
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}