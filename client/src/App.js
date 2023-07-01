import React, { Component } from 'react'
import Web3 from 'web3'

import './App.css';

import MovieToken from "./contracts/MovieToken.json";
import MovieTokenKyc from "./contracts/MovieTokenKyc.json";
import MovieTokenSale from "./contracts/MovieTokenSale.json";

import detectEthereumProvider from '@metamask/detect-provider';

class App extends Component {
  state = {loaded: false, kyc_approve_address: "", num_tokens: "0"};

  // Create web3 provider and smart contract instance as the component is mounting
  componentDidMount = async () => {
    try {
      this.accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      this.deployer_account = this.accounts[0];

      // const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
      const provider = await detectEthereumProvider();     
      this.web3 = new Web3(provider);

      this.networkId = await this.web3.eth.net.getId();

      this.movieTokenInst = new this.web3.eth.Contract( 
        MovieToken.abi,
        MovieToken.networks[this.networkId].address
      );

      this.movieTokenKycInst = new this.web3.eth.Contract( 
        MovieTokenKyc.abi,
        MovieTokenKyc.networks[this.networkId].address
      );

      this.movieTokenSaleInst = new this.web3.eth.Contract( 
        MovieTokenSale.abi,
        MovieTokenSale.networks[this.networkId].address
      );

      this.movieTokenSaleInstAddress = this.movieTokenSaleInst._address;

      this.setState({ loaded: true });
    } catch (error) {
      alert("Failed to load Web3, accounts, and contracts. ", JSON.stringify(error));
    }
  }

  handleKycApproveAccountInput = (event) => {
    const target = event.target;
    const name = target.name;

    this.setState({[name]: target.value});
    this.setState({["num_tokens"]: "0"});
  }

  handleKycApproveAccountSubmit = async(event) => {
    await this.movieTokenKycInst.methods.setAllowed(this.state.kyc_approve_address).send({from: this.deployer_account, gas: "1000000"});
    let numTokens = await this.movieTokenInst.methods.balanceOf(this.state.kyc_approve_address).call({from: this.deployer_account});
    this.setState({["num_tokens"]: numTokens.toString()});

    alert("Congrats. You can now buy tokens. ", numTokens);
  }

  // Render the app. Add a text input and button to send to buy token
  render() {
    if(!this.state.loaded) {
      return <div>Loading Web3, accounts, and contracts</div>
    }
    return (
      <div className="App">
        <h1>Welcome to Movie Token Sale dApp</h1><br/>

        <h2>KYC approve account to buy token</h2>
        <p>Enter address to be KYC approved: <input type="text" name="kyc_approve_address" value={this.state.kyc_approve_account} onChange={this.handleKycApproveAccountInput}></input>
          &nbsp;&nbsp;<button type="button" onClick={this.handleKycApproveAccountSubmit}>KYC Approve Account</button></p>

        <p>Each token costs 0.1 ether</p>
        <p>To buy tokens, send the amount to this address <b>{this.movieTokenSaleInstAddress}</b></p>

       <h3>Currently you have <b>{this.state.num_tokens}</b> tokens</h3> 
      </div>
    );
  }
}

export default App;