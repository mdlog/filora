// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract LicenseVerifier {
    IERC1155 public licenseNFT;
    
    mapping(uint256 => mapping(address => uint256)) public licenseExpiry;
    
    event LicenseGranted(address indexed user, uint256 indexed tokenId, uint256 expiry);
    
    constructor(address _licenseNFT) {
        licenseNFT = IERC1155(_licenseNFT);
    }
    
    function hasLicense(address user, uint256 tokenId) external view returns (bool) {
        return licenseNFT.balanceOf(user, tokenId) > 0;
    }
    
    function isLicenseActive(address user, uint256 tokenId) external view returns (bool) {
        if (licenseNFT.balanceOf(user, tokenId) == 0) return false;
        
        uint256 expiry = licenseExpiry[tokenId][user];
        if (expiry == 0) return true; // No expiry set
        
        return block.timestamp < expiry;
    }
    
    function setLicenseExpiry(uint256 tokenId, address user, uint256 expiry) external {
        licenseExpiry[tokenId][user] = expiry;
        emit LicenseGranted(user, tokenId, expiry);
    }
}
