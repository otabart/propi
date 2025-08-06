// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyEscrow
 * @dev Escrow contract for secure property token transfers with payment
 * Handles both full property sales and fractional share transfers
 */
contract PropertyEscrow is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant NOTARY_ROLE = keccak256("NOTARY");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR");
    
    // Escrow ID counter
    uint256 private _escrowIdCounter;
    
    // Escrow types
    enum EscrowType {
        PropertySale,      // Full property NFT sale
        FractionalSale,    // Fractional shares sale
        RentalDeposit      // Rental security deposit
    }
    
    // Escrow status
    enum EscrowStatus {
        Created,
        Funded,
        DocumentsSubmitted,
        NotaryApproved,
        Completed,
        Cancelled,
        Disputed
    }
    
    // Escrow structure
    struct Escrow {
        EscrowType escrowType;
        EscrowStatus status;
        address seller;
        address buyer;
        address propertyContract;
        uint256 tokenId;           // NFT token ID or fractional asset ID
        uint256 amount;             // Number of shares for fractional
        uint256 price;              // Total price in payment token
        address paymentToken;       // USDC or other token
        uint256 depositAmount;      // Amount deposited by buyer
        uint256 createdAt;
        uint256 fundedAt;
        uint256 completedAt;
        string documentHash;        // IPFS hash of sale documents
        address notary;             // Assigned notary
        bool sellerApproved;
        bool buyerApproved;
        bool notaryApproved;
        uint256 escrowFee;          // Platform fee
    }
    
    // Milestone structure for construction/development escrows
    struct Milestone {
        string description;
        uint256 releaseAmount;
        bool completed;
        uint256 completedAt;
        string proofHash;
    }
    
    // Mappings
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(address => uint256[]) public userEscrows;
    mapping(uint256 => mapping(address => bool)) public hasWithdrawn;
    
    // Fee configuration
    uint256 public escrowFeePercent = 100; // 1% = 100 basis points
    address public feeRecipient;
    
    // Timelock for automatic release
    uint256 public defaultTimelock = 30 days;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        EscrowType escrowType,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event EscrowFunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );
    
    event DocumentsSubmitted(
        uint256 indexed escrowId,
        string documentHash
    );
    
    event EscrowApproved(
        uint256 indexed escrowId,
        address indexed approver,
        string role
    );
    
    event EscrowCompleted(
        uint256 indexed escrowId,
        uint256 completedAt
    );
    
    event EscrowCancelled(
        uint256 indexed escrowId,
        address indexed cancelledBy
    );
    
    event EscrowDisputed(
        uint256 indexed escrowId,
        address indexed disputedBy,
        string reason
    );
    
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        uint256 releasedAmount
    );
    
    constructor(address _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new escrow for property sale
     */
    function createPropertyEscrow(
        address _buyer,
        address _propertyContract,
        uint256 _tokenId,
        uint256 _price,
        address _paymentToken,
        address _notary
    ) external nonReentrant returns (uint256) {
        require(_buyer != address(0) && _buyer != msg.sender, "Invalid buyer");
        require(_propertyContract != address(0), "Invalid property contract");
        require(_price > 0, "Invalid price");
        require(_paymentToken != address(0), "Invalid payment token");
        
        // Verify seller owns the property
        IERC721 propertyNFT = IERC721(_propertyContract);
        require(propertyNFT.ownerOf(_tokenId) == msg.sender, "Not property owner");
        
        _escrowIdCounter++;
        uint256 escrowId = _escrowIdCounter;
        
        uint256 fee = (_price * escrowFeePercent) / 10000;
        
        escrows[escrowId] = Escrow({
            escrowType: EscrowType.PropertySale,
            status: EscrowStatus.Created,
            seller: msg.sender,
            buyer: _buyer,
            propertyContract: _propertyContract,
            tokenId: _tokenId,
            amount: 1,
            price: _price,
            paymentToken: _paymentToken,
            depositAmount: 0,
            createdAt: block.timestamp,
            fundedAt: 0,
            completedAt: 0,
            documentHash: "",
            notary: _notary,
            sellerApproved: false,
            buyerApproved: false,
            notaryApproved: false,
            escrowFee: fee
        });
        
        userEscrows[msg.sender].push(escrowId);
        userEscrows[_buyer].push(escrowId);
        
        emit EscrowCreated(escrowId, EscrowType.PropertySale, msg.sender, _buyer, _price);
        
        return escrowId;
    }
    
    /**
     * @dev Create escrow for fractional shares sale
     */
    function createFractionalEscrow(
        address _buyer,
        address _propertyContract,
        uint256 _assetId,
        uint256 _shares,
        uint256 _totalPrice,
        address _paymentToken
    ) external nonReentrant returns (uint256) {
        require(_buyer != address(0) && _buyer != msg.sender, "Invalid buyer");
        require(_shares > 0, "Invalid share amount");
        require(_totalPrice > 0, "Invalid price");
        
        _escrowIdCounter++;
        uint256 escrowId = _escrowIdCounter;
        
        uint256 fee = (_totalPrice * escrowFeePercent) / 10000;
        
        escrows[escrowId] = Escrow({
            escrowType: EscrowType.FractionalSale,
            status: EscrowStatus.Created,
            seller: msg.sender,
            buyer: _buyer,
            propertyContract: _propertyContract,
            tokenId: _assetId,
            amount: _shares,
            price: _totalPrice,
            paymentToken: _paymentToken,
            depositAmount: 0,
            createdAt: block.timestamp,
            fundedAt: 0,
            completedAt: 0,
            documentHash: "",
            notary: address(0),
            sellerApproved: false,
            buyerApproved: false,
            notaryApproved: false,
            escrowFee: fee
        });
        
        userEscrows[msg.sender].push(escrowId);
        userEscrows[_buyer].push(escrowId);
        
        emit EscrowCreated(escrowId, EscrowType.FractionalSale, msg.sender, _buyer, _totalPrice);
        
        return escrowId;
    }
    
    /**
     * @dev Fund the escrow (buyer deposits payment)
     */
    function fundEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status == EscrowStatus.Created, "Invalid status");
        require(msg.sender == escrow.buyer, "Not the buyer");
        
        uint256 totalAmount = escrow.price + escrow.escrowFee;
        
        IERC20 paymentToken = IERC20(escrow.paymentToken);
        require(
            paymentToken.transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed"
        );
        
        escrow.depositAmount = totalAmount;
        escrow.fundedAt = block.timestamp;
        escrow.status = EscrowStatus.Funded;
        
        emit EscrowFunded(_escrowId, msg.sender, totalAmount);
    }
    
    /**
     * @dev Submit sale documents
     */
    function submitDocuments(uint256 _escrowId, string memory _documentHash) external {
        Escrow storage escrow = escrows[_escrowId];
        
        require(
            escrow.status == EscrowStatus.Funded,
            "Escrow not funded"
        );
        require(
            msg.sender == escrow.seller || msg.sender == escrow.notary,
            "Not authorized"
        );
        
        escrow.documentHash = _documentHash;
        escrow.status = EscrowStatus.DocumentsSubmitted;
        
        emit DocumentsSubmitted(_escrowId, _documentHash);
    }
    
    /**
     * @dev Approve escrow completion (by seller)
     */
    function approveAsSeller(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.seller, "Not the seller");
        require(escrow.status >= EscrowStatus.DocumentsSubmitted, "Documents not submitted");
        require(!escrow.sellerApproved, "Already approved");
        
        escrow.sellerApproved = true;
        
        emit EscrowApproved(_escrowId, msg.sender, "SELLER");
        
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Approve escrow completion (by buyer)
     */
    function approveAsBuyer(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.buyer, "Not the buyer");
        require(escrow.status >= EscrowStatus.DocumentsSubmitted, "Documents not submitted");
        require(!escrow.buyerApproved, "Already approved");
        
        escrow.buyerApproved = true;
        
        emit EscrowApproved(_escrowId, msg.sender, "BUYER");
        
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Approve escrow completion (by notary)
     */
    function approveAsNotary(uint256 _escrowId) external onlyRole(NOTARY_ROLE) {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.notary == msg.sender, "Not assigned notary");
        require(escrow.status >= EscrowStatus.DocumentsSubmitted, "Documents not submitted");
        require(!escrow.notaryApproved, "Already approved");
        
        escrow.notaryApproved = true;
        escrow.status = EscrowStatus.NotaryApproved;
        
        emit EscrowApproved(_escrowId, msg.sender, "NOTARY");
        
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Check if escrow can be completed and execute
     */
    function _checkAndCompleteEscrow(uint256 _escrowId) private {
        Escrow storage escrow = escrows[_escrowId];
        
        bool canComplete = false;
        
        if (escrow.escrowType == EscrowType.PropertySale) {
            // Requires all three approvals for property sales
            canComplete = escrow.sellerApproved && 
                         escrow.buyerApproved && 
                         escrow.notaryApproved;
        } else if (escrow.escrowType == EscrowType.FractionalSale) {
            // Only requires seller and buyer approval for fractional sales
            canComplete = escrow.sellerApproved && escrow.buyerApproved;
        }
        
        if (canComplete) {
            _completeEscrow(_escrowId);
        }
    }
    
    /**
     * @dev Complete the escrow and release funds/tokens
     */
    function _completeEscrow(uint256 _escrowId) private {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status != EscrowStatus.Completed, "Already completed");
        require(escrow.status != EscrowStatus.Cancelled, "Escrow cancelled");
        
        // Transfer payment to seller and fee to platform
        IERC20 paymentToken = IERC20(escrow.paymentToken);
        require(
            paymentToken.transfer(escrow.seller, escrow.price),
            "Payment transfer failed"
        );
        require(
            paymentToken.transfer(feeRecipient, escrow.escrowFee),
            "Fee transfer failed"
        );
        
        // Transfer property token to buyer
        if (escrow.escrowType == EscrowType.PropertySale) {
            IERC721 propertyNFT = IERC721(escrow.propertyContract);
            propertyNFT.safeTransferFrom(escrow.seller, escrow.buyer, escrow.tokenId);
        }
        // Note: For fractional sales, the transfer would be handled differently
        // depending on the implementation of the fractional property contract
        
        escrow.status = EscrowStatus.Completed;
        escrow.completedAt = block.timestamp;
        
        emit EscrowCompleted(_escrowId, block.timestamp);
    }
    
    /**
     * @dev Cancel escrow (only if not funded or by mutual agreement)
     */
    function cancelEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(
            msg.sender == escrow.seller || msg.sender == escrow.buyer,
            "Not authorized"
        );
        require(
            escrow.status != EscrowStatus.Completed,
            "Already completed"
        );
        
        // If funded, require both parties to agree or timeout
        if (escrow.status == EscrowStatus.Funded) {
            require(
                block.timestamp > escrow.fundedAt + defaultTimelock ||
                (escrow.sellerApproved && escrow.buyerApproved),
                "Cannot cancel yet"
            );
            
            // Refund buyer
            IERC20 paymentToken = IERC20(escrow.paymentToken);
            require(
                paymentToken.transfer(escrow.buyer, escrow.depositAmount),
                "Refund failed"
            );
        }
        
        escrow.status = EscrowStatus.Cancelled;
        
        emit EscrowCancelled(_escrowId, msg.sender);
    }
    
    /**
     * @dev Raise a dispute
     */
    function raiseDispute(uint256 _escrowId, string memory _reason) external {
        Escrow storage escrow = escrows[_escrowId];
        
        require(
            msg.sender == escrow.seller || msg.sender == escrow.buyer,
            "Not authorized"
        );
        require(
            escrow.status != EscrowStatus.Completed && 
            escrow.status != EscrowStatus.Cancelled,
            "Invalid status"
        );
        
        escrow.status = EscrowStatus.Disputed;
        
        emit EscrowDisputed(_escrowId, msg.sender, _reason);
    }
    
    /**
     * @dev Resolve dispute (by arbitrator)
     */
    function resolveDispute(
        uint256 _escrowId,
        bool _releaseToSeller
    ) external onlyRole(ARBITRATOR_ROLE) {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        
        IERC20 paymentToken = IERC20(escrow.paymentToken);
        
        if (_releaseToSeller) {
            // Release to seller
            require(
                paymentToken.transfer(escrow.seller, escrow.price),
                "Transfer failed"
            );
            
            // Transfer property to buyer if applicable
            if (escrow.escrowType == EscrowType.PropertySale) {
                IERC721 propertyNFT = IERC721(escrow.propertyContract);
                propertyNFT.safeTransferFrom(escrow.seller, escrow.buyer, escrow.tokenId);
            }
        } else {
            // Refund to buyer
            require(
                paymentToken.transfer(escrow.buyer, escrow.depositAmount),
                "Refund failed"
            );
        }
        
        // Platform keeps the fee
        require(
            paymentToken.transfer(feeRecipient, escrow.escrowFee),
            "Fee transfer failed"
        );
        
        escrow.status = EscrowStatus.Completed;
        escrow.completedAt = block.timestamp;
        
        emit EscrowCompleted(_escrowId, block.timestamp);
    }
    
    /**
     * @dev Get user's escrows
     */
    function getUserEscrows(address _user) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }
    
    /**
     * @dev Update escrow fee
     */
    function updateEscrowFee(uint256 _feePercent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_feePercent <= 300, "Fee too high"); // Max 3%
        escrowFeePercent = _feePercent;
    }
    
    /**
     * @dev Update default timelock
     */
    function updateTimelock(uint256 _timelock) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultTimelock = _timelock;
    }
}