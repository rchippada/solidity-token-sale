// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./MovieToken.sol";
import "./MovieTokenKyc.sol";

contract MovieTokenSale {
    MovieToken public movieToken;
    MovieTokenKyc private movieTokenKyc;

    uint public tokenPriceInWei = 0.1 ether;

    address owner;

    event TokensPurchased(address buyer, uint amount);
    constructor(MovieToken token, MovieTokenKyc kyc) {
        movieToken = token;
        movieTokenKyc = kyc;
        owner = msg.sender;
    }

    // Invoked by the receive function to transfer tokens to the buyer
    // kycApproved for buyer (to be done using dapp frontent client) and fund amount are checked
    // After transfering tokens to buyer, token price amount is transferred to the deployer account
    // Any remaining funds after purchasing tokens are returned to the buyer
    function buyTokens(address payable buyer) private {
        require(movieTokenKyc.isAllowed(buyer) == true, "Not allowed to buy tokens");
        require(msg.value >= tokenPriceInWei, "Insufficient amount of funds sent");

        uint tokensToTransfer = msg.value / tokenPriceInWei;

        movieToken.buyToken(buyer, tokensToTransfer);

        payable(owner).transfer(tokenPriceInWei*tokensToTransfer);  // transfer token price amount to the owner account
        buyer.transfer(msg.value - tokenPriceInWei*tokensToTransfer);   // transer any remaining funds to the buyer

        emit TokensPurchased(buyer, tokensToTransfer);
    }

    // A buyer can buy tokens by sending the required amount of wei to this contract
    // A buyer should be kycApproved prior to sending money to this contract (using the dapp frontent in this example implementation)
    receive() external payable {
       buyTokens(payable(msg.sender));
    }
}
