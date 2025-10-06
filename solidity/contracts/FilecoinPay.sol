// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FilecoinPay is Ownable, ReentrancyGuard {
    IERC20 public usdfc;
    
    mapping(uint256 => uint256) public royaltyPercentage; // tokenId => percentage (basis points)
    mapping(uint256 => address) public royaltyRecipient; // tokenId => creator
    mapping(address => uint256) public pendingRoyalties;
    mapping(uint256 => uint256) public assetPrice; // tokenId => price in USDFC
    
    event PaymentProcessed(address indexed from, address indexed to, uint256 amount, uint256 tokenId);
    event RoyaltyPaid(address indexed creator, uint256 amount, uint256 tokenId);
    event RoyaltyWithdrawn(address indexed creator, uint256 amount);
    event PriceSet(uint256 indexed tokenId, uint256 price);
    
    constructor(address _usdfc) Ownable(msg.sender) {
        usdfc = IERC20(_usdfc);
    }
    
    function setRoyalty(uint256 tokenId, address creator, uint256 percentage) external {
        require(percentage <= 10000, "Max 100%");
        royaltyPercentage[tokenId] = percentage;
        royaltyRecipient[tokenId] = creator;
    }
    
    function setPrice(uint256 tokenId, uint256 price) external {
        assetPrice[tokenId] = price;
        emit PriceSet(tokenId, price);
    }
    
    function processPayment(address to, uint256 amount, uint256 tokenId) external nonReentrant {
        require(usdfc.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        uint256 royaltyAmount = 0;
        address creator = royaltyRecipient[tokenId];
        
        if (creator != address(0) && royaltyPercentage[tokenId] > 0) {
            royaltyAmount = (amount * royaltyPercentage[tokenId]) / 10000;
            pendingRoyalties[creator] += royaltyAmount;
            emit RoyaltyPaid(creator, royaltyAmount, tokenId);
        }
        
        uint256 sellerAmount = amount - royaltyAmount;
        
        require(usdfc.transferFrom(msg.sender, to, sellerAmount), "Transfer to seller failed");
        
        emit PaymentProcessed(msg.sender, to, amount, tokenId);
    }
    
    function withdrawRoyalties() external nonReentrant {
        uint256 amount = pendingRoyalties[msg.sender];
        require(amount > 0, "No royalties");
        
        pendingRoyalties[msg.sender] = 0;
        require(usdfc.transfer(msg.sender, amount), "Transfer failed");
        
        emit RoyaltyWithdrawn(msg.sender, amount);
    }
}
