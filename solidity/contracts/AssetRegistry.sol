// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssetRegistry {
    struct Asset {
        address owner;
        uint256 datasetId;
        uint256 providerId;
        string pieceCid;
        uint256 price;
        uint256 timestamp;
        bool isActive;
    }
    
    Asset[] public assets;
    mapping(address => uint256[]) public ownerAssets;
    mapping(uint256 => mapping(uint256 => uint256)) public datasetToAssetId; // providerId => datasetId => assetId
    
    event AssetRegistered(
        uint256 indexed assetId,
        address indexed owner,
        uint256 datasetId,
        uint256 providerId,
        string pieceCid
    );
    event AssetDeactivated(uint256 indexed assetId);
    
    function registerAsset(
        uint256 datasetId,
        uint256 providerId,
        string memory pieceCid,
        uint256 price
    ) external returns (uint256) {
        // Check if asset already registered
        uint256 existingAssetId = datasetToAssetId[providerId][datasetId];
        if (existingAssetId > 0 && assets[existingAssetId - 1].isActive) {
            revert("Asset already registered");
        }
        
        uint256 assetId = assets.length;
        assets.push(Asset({
            owner: msg.sender,
            datasetId: datasetId,
            providerId: providerId,
            pieceCid: pieceCid,
            price: price,
            timestamp: block.timestamp,
            isActive: true
        }));
        
        ownerAssets[msg.sender].push(assetId);
        datasetToAssetId[providerId][datasetId] = assetId + 1; // Store as 1-indexed
        
        emit AssetRegistered(assetId, msg.sender, datasetId, providerId, pieceCid);
        return assetId;
    }
    
    function deactivateAsset(uint256 assetId) external {
        require(assetId < assets.length, "Invalid asset ID");
        require(assets[assetId].owner == msg.sender, "Not asset owner");
        require(assets[assetId].isActive, "Asset already inactive");
        
        assets[assetId].isActive = false;
        emit AssetDeactivated(assetId);
    }
    
    function getAllAssets() external view returns (Asset[] memory) {
        return assets;
    }
    
    function getActiveAssets() external view returns (Asset[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].isActive) {
                activeCount++;
            }
        }
        
        Asset[] memory activeAssets = new Asset[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].isActive) {
                activeAssets[index] = assets[i];
                index++;
            }
        }
        return activeAssets;
    }
    
    function getAssetsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerAssets[owner];
    }
    
    function getAsset(uint256 assetId) external view returns (Asset memory) {
        require(assetId < assets.length, "Invalid asset ID");
        return assets[assetId];
    }
    
    function getTotalAssets() external view returns (uint256) {
        return assets.length;
    }
}
