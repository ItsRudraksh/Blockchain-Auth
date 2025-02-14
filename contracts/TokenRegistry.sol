// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenRegistry {
    struct TokenInfo {
        bool isValid;
        uint256 expiry;
    }

    mapping(bytes32 => TokenInfo) public tokens;

    function registerToken(bytes32 tokenHash, uint256 expiry) public {
        require(!tokens[tokenHash].isValid, "Token already exists");
        tokens[tokenHash] = TokenInfo(true, expiry);
    }

    function validateToken(bytes32 tokenHash) public view returns (bool) {
        return
            tokens[tokenHash].isValid &&
            block.timestamp < tokens[tokenHash].expiry;
    }

    function removeToken(bytes32 tokenHash) public {
        require(tokens[tokenHash].isValid, "Token does not exist");
        tokens[tokenHash].isValid = false;
    }
}
