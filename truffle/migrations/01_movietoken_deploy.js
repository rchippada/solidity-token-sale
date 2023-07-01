const movieTokenContract = artifacts.require("MovieToken");
const movieTokenSaleContract = artifacts.require("MovieTokenSale");
const movieTokenKycContract = artifacts.require("MovieTokenKyc");

require("dotenv").config({path: "../../.env"});

module.exports = async function(deployer, network, accounts) {
    let deployerAccount = accounts[0];
    
    await deployer.deploy(movieTokenContract, process.env.INITIAL_TOKEN_SUPPLY, {from: deployerAccount});
    let movieTokenInstance = await movieTokenContract.deployed();

    // Set deployerAccount as KYC allowed
    await deployer.deploy(movieTokenKycContract, {from: deployerAccount});
    let movieTokenKycInstance = await movieTokenKycContract.deployed();
    await movieTokenKycInstance.setAllowed(deployerAccount);

    await deployer.deploy(movieTokenSaleContract, movieTokenInstance.address, movieTokenKycInstance.address, {from: deployerAccount});
}
