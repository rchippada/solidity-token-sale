// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MovieTokenKyc is Ownable {
    mapping(address => bool) private kycMapping;

    event KycApproved(address account);
    event KycRevoked(address account);

    function setAllowed(address account) public onlyOwner {
        kycMapping[account] = true;
        emit KycApproved(account);
    }
    function setRevoked(address account) public onlyOwner {
        kycMapping[account] = false;
        emit KycRevoked(account);
    }

    function isAllowed(address user) public view returns(bool){
        return kycMapping[user];
    }
}
