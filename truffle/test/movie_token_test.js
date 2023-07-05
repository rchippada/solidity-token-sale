// MovieToken test

const MovieToken = artifacts.require("MovieToken");
const truffleAssert = require('truffle-assertions');

require("dotenv").config({path: "../../.env"});

contract('MovieToken', (accounts) => {
    const deployer = accounts[0];

    beforeEach (async() => {
        this.movieTokenInstance = await MovieToken.new(process.env.INITIAL_TOKEN_SUPPLY);
    })

    it ("should have an initial supply of {process.env.INITIAL_TOKEN_SUPPLY} tokens", async() => {
        let totalSupply = await this.movieTokenInstance.totalSupply();

        let deployerBalance = await this.movieTokenInstance.balanceOf(accounts[0]);
        assert.equal(deployerBalance, totalSupply.toString());
    })

    it("should be able to send a token to a buyer", async() => {
        let totalSupply = await this.movieTokenInstance.totalSupply();

        let deployerBalance = await this.movieTokenInstance.balanceOf(deployer);
        assert.equal(deployerBalance.toString(), totalSupply.toString());

        let buyer = accounts[1];
        await this.movieTokenInstance.transfer(buyer, 1);

        deployerBalance = await this.movieTokenInstance.balanceOf(deployer);

        assert.equal(deployerBalance, totalSupply-1);

        let buyerBalance = await this.movieTokenInstance.balanceOf(buyer);
        assert.equal(buyerBalance, 1);
    })

    it("should not be possible to send more tokens than available", async() => {
        let movieTokenInst = await MovieToken.deployed();
        let totalSupply = await movieTokenInst.totalSupply();
        let deployerBalance = await movieTokenInst.balanceOf(deployer);
        await truffleAssert.reverts(movieTokenInst.transfer(accounts[1], totalSupply+1));
        assert.equal((await movieTokenInst.balanceOf(deployer)), deployerBalance.toString());
    })

    it("buyer should be able to bun a token", async() => {
        let totalSupply = await this.movieTokenInstance.totalSupply();

        let buyer = accounts[1];
        await this.movieTokenInstance.transfer(buyer, 1);

        let buyerBalance = await this.movieTokenInstance.balanceOf(buyer);
        assert.equal(buyerBalance, 1);

        await this.movieTokenInstance.burnToken(buyer, {from: deployer});
        buyerBalance = await this.movieTokenInstance.balanceOf(buyer);
        assert.equal(buyerBalance, 0);

        totalSupplyAfterBurn = await this.movieTokenInstance.totalSupply();
        assert.equal(totalSupplyAfterBurn, totalSupply-1);

        await truffleAssert.reverts(    // trying to burn one more should fail
            this.movieTokenInstance.burnToken(buyer, {from: deployer}),
            "ERC20: burn amount exceeds balance"
        );
    })
})
