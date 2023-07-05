// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MovieToken is ERC20, Ownable {

    constructor(uint initialSupply) ERC20("Movie Ticket Token", "MTT") {
        _mint(msg.sender, initialSupply);
    }

    function buyToken(address buyer, uint amount) public {
        _transfer(owner(), buyer, amount);
    }

    function burnToken(address buyer) public onlyOwner {
        _burn(buyer, 1);
    }
}