// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FiloraLicense1155 is ERC1155, Ownable {
    string public name = "Filora License";
    string public symbol = "FLICENSE";
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public creators;
    
    event LicenseMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    
    constructor() ERC1155("") Ownable(msg.sender) {}
    
    function mint(address to, uint256 tokenId, uint256 amount) external {
        if (creators[tokenId] == address(0)) {
            creators[tokenId] = msg.sender;
        }
        _mint(to, tokenId, amount, "");
        emit LicenseMinted(to, tokenId, amount);
    }
    
    function mintWithURI(address to, uint256 tokenId, uint256 amount, string memory tokenURI) external {
        if (creators[tokenId] == address(0)) {
            creators[tokenId] = msg.sender;
        }
        _tokenURIs[tokenId] = tokenURI;
        _mint(to, tokenId, amount, "");
        emit LicenseMinted(to, tokenId, amount);
    }
    
    function setURI(uint256 tokenId, string memory newuri) external {
        require(creators[tokenId] == msg.sender, "Not creator");
        _tokenURIs[tokenId] = newuri;
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}
