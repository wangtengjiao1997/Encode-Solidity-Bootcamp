import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from '../assets/MyERC20Votes.json';
import * as orJosn from '../assets/MyContract.json';
import * as voteJosn from '../assets/Ballot.json';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;
  oracleProvider: ethers.providers.BaseProvider;
  oracleContract : ethers.Contract;
  voteProvider: ethers.providers.BaseProvider;
  voteContract : ethers.Contract;
  signer: ethers.Signer;

  constructor(private configService: ConfigService){
    const apiKey = this.configService.get<string>('INFURA_API_KEY');
    this.provider = new ethers.providers.InfuraProvider('sepolia', apiKey);
    this.contract = new ethers.Contract(this.getAddress(), tokenJson.abi, this.provider,);
    this.oracleProvider = new ethers.providers.AlchemyProvider(
      "maticmum",
      process.env.ALCHEMY_API_KEY
  ); 
    this.oracleContract = new ethers.Contract("0x786786a99e181488499935374d98ecd2d89ec30b", orJosn.abi, this.oracleProvider,);

    this.voteProvider = new ethers.providers.InfuraProvider(
      "sepolia",
      process.env.INFURA_API_KEY
      );
    this.voteContract = new ethers.Contract("0x9f0699762b8746e7ffb0a88e4689ccde38b0530c", voteJosn.abi, this.voteProvider,);
    const pKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(pKey);
    this.signer = wallet.connect(this.provider);
  }

  getLastBlock(){
    return this.provider.getBlock('latest');
  }

  getAddress(){
    const contractAddress = this.configService.get<string>('TOKEN_ADDRESS');
    return contractAddress;
  }

  getTotalSupply(){
    return this.contract.totalSupply();
  }

  getBalance(address: string){ 
    return this.contract.balanceOf(address);
  }

  async getReceipt(hash: string){
    const tx = await this.provider.getTransaction(hash);
    const receipt = await tx.wait();
    return receipt;
  }

  async awaitTx(tx: ethers.providers.TransactionResponse){
    return await tx.wait()
  }

  requestTokens(address: string){
    return this.contract.connect(this.signer).mint(address, ethers.utils.parseUnits("1"));
  }

  async getBTCprice(){
    const lastPrice = await this.oracleContract.getBtcSpotPrice();
    console.log(lastPrice);
    return ethers.utils.formatUnits(lastPrice);
  }

  async delegate(address){
    const delegateTx = await this.contract.connect(this.signer).delegate(address);
    await delegateTx.wait();
    const votes = await this.contract.getVotes(address);
    return ethers.utils.formatUnits(votes);
  }

  async vote(address:string, proposal:number, votenum:string){
    console.log(votenum);
    
    const voteTx = await this.voteContract.connect(address).vote(proposal, ethers.utils.parseUnits(votenum));
    const voteTxReceipt = voteTx.wait();
    return voteTxReceipt;
  }

  async getResult(){
    const voteTx = await this.voteContract.winnerName();
    console.log(ethers.utils.parseBytes32String(voteTx))
    return {result: ethers.utils.parseBytes32String(voteTx)};
  }
}
