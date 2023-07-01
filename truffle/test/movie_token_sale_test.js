// MovieTokenSale test

const MovieTokenSale = artifacts.require("MovieTokenSale");
const MovieToken = artifacts.require("MovieToken");
const MovieTokenKyc = artifacts.require("MovieTokenKyc");
const truffleAssert = require('truffle-assertions');

contract('MovieTokenSale', (accounts) => {

    it ("should not be able to buy tokens if kyc not approved", async() => {
        const movieTokenSaleInst = await MovieTokenSale.deployed();
        
        await truffleAssert.reverts(
            movieTokenSaleInst.sendTransaction ({from: accounts[2], value: web3.utils.toWei("0.1", "ether")}),
            "Not allowed to buy tokens"
        );
    })

    it ("should be able to buy tokens", async() => {
        const movieTokenInst = await MovieToken.deployed();
        const movieTokenSaleInst = await MovieTokenSale.deployed();
        const movieTokenKycInst = await MovieTokenKyc.deployed();
        
        let totalSupply = await movieTokenInst.totalSupply();

        let deployerSupply = await movieTokenInst.balanceOf(accounts[0]);
        assert.equal(deployerSupply.toString(), totalSupply.toString());

        let deployerAcctBalanceBeforeBuyingTokens = await web3.eth.getBalance(accounts[0]);
        let buyerAcctBalanceBeforeBuyingTokens = await web3.eth.getBalance(accounts[1]);

        let txResult = await movieTokenKycInst.setAllowed(accounts[1]);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        txResult = await movieTokenSaleInst.sendTransaction ({from: accounts[1], value: web3.utils.toWei("0.21", "ether")}); //2 tokens plus change
        truffleAssert.eventEmitted(txResult, 'TokensPurchased');
        
        deployerSupply = await movieTokenInst.balanceOf(accounts[0]);
        assert.equal(deployerSupply.toString(), (totalSupply-2).toString());

        let buyerTokenBalance = await movieTokenInst.balanceOf(accounts[1]);
        assert.equal(buyerTokenBalance, 2);

        let deployerAcctBalanceAfterBuyingTokens = await web3.eth.getBalance(accounts[0]);
        let buyerAcctBalanceAfterBuyingTokens = await web3.eth.getBalance(accounts[1]);

        assert.equal((deployerAcctBalanceAfterBuyingTokens - deployerAcctBalanceBeforeBuyingTokens) > web3.utils.toWei("0.1", "ether"), true, "Deployer account is expected to have received about two token price"); // two tokens price minus gas fees
        assert.equal((buyerAcctBalanceBeforeBuyingTokens - buyerAcctBalanceAfterBuyingTokens) > web3.utils.toWei("0.2", "ether"), true, "Balance expected to be depleted by at least two token price");

        let contractBalance = await web3.eth.getBalance(movieTokenSaleInst.address);
        assert.equal(contractBalance, 0, "Contract balance expected to be zero after all the transfers(tokens to buyer, remaining funds to buyer, token price to deployer)");
    })

    it ("should fail to buy tokens if insufficient amount of funds sent", async() => {
        const movieTokenSaleInst = await MovieTokenSale.deployed();
        const movieTokenKycInst = await MovieTokenKyc.deployed();

        let txResult = await movieTokenKycInst.setAllowed(accounts[3]);
        truffleAssert.eventEmitted(txResult, 'KycApproved');

        await truffleAssert.reverts(
            movieTokenSaleInst.sendTransaction ({from: accounts[3], value: web3.utils.toWei("0.01", "ether")}),
            "Insufficient amount of funds sent"
        );
    })
})
