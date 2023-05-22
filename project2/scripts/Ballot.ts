import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();
const ADDRESS = "0xad4a522DEb5E9acdF7fe54047a878DE31D606"

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(`Connected to the address ${wallet.address}`);
    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.ALCHEMY_API_KEY
        );

    const lastblock = await provider.getBlock("latest");
    console.log(`Connect to Block: ${lastblock?.number}`);
    
    const signer = wallet.connect(provider);
    console.log(`Connectted to ${signer.address}`);
    const balance = await signer.getBalance();
    console.log(`Balance is ${balance} WEI`);

    const proposals = process.argv.slice(2);
    // proposals.forEach((element, index) =>{
    //     console.log(`Proposals N.${index+1} :${element}`);
    // });
    
    const ballotContractFactory = new Ballot__factory(signer);
    const gasLimit = await signer.estimateGas(ballotContractFactory.getDeployTransaction(
        proposals.map(ethers.utils.formatBytes32String)
      ));

    console.log(`Estimated gas needed: ${gasLimit.toString()}`);
   
    const ballotContract = await ballotContractFactory.deploy(
        proposals.map(ethers.utils.formatBytes32String),
        { gasLimit }
    )
    
    const chairperson = await ballotContract.chairperson();
    console.log(`The chairperson for this ballot is ${chairperson}`);
    const giveRightToVoteTx = await ballotContract.giveRightToVote(ADDRESS);
    const deployTxReceipt = await ballotContract.deployTransaction.wait();
    console.log(`Transaction complete at block ${deployTxReceipt.blockNumber} with hash ${deployTxReceipt.blockHash}`)
    console.log(await signer.getBalance());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});