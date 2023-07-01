// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MovieToken is ERC20 {

    address owner;
    constructor(uint initialSupply) ERC20("Movie Ticket Token", "MTT") {
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
    }

    function buyToken(address buyer, uint amount) public {
        _transfer(owner, buyer, amount);
    }
}