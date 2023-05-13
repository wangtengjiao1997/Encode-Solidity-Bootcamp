import { ethers } from "hardhat";
import { Ballot__factory, MyERC20Votes__factory } from "../typechain-types";
import { tokenizaedBallotSol } from "../typechain-types/contracts";
import { MyERC20Votes } from "../typechain-types/contracts";

const MINT_VALUE  = ethers.utils.parseUnits("10");

async function main() {
    const [deployer, acc1, acc2] = await ethers.getSigners();
    const ballotcontratFactory = new Ballot__factory(deployer); 
    const myERC20VotesFactory  = new MyERC20Votes__factory(deployer); 

    const myERC20VotesContract = await myERC20VotesFactory.deploy();
    await myERC20VotesContract.deployed();
    const myERC20deployRxReceipt = await myERC20VotesContract.deployTransaction.wait();
    const blockNum = myERC20deployRxReceipt.blockNumber;
    console.log(`The ERC20 contract was deployed at address
    ${myERC20VotesContract.address} at the block ${blockNum}\n`);

    const Proposals = ['Proposal 1', 'Proposal 2', 'Proposal 3'];
    const proposalNamesBytes32 = Proposals.map((name) => ethers.utils.formatBytes32String(name));
    

    //mint token
    const mintTx = await myERC20VotesContract.mint(acc1.address, MINT_VALUE);
    const mintTxReceipt = await mintTx.wait();
    console.log(`Minted ${ethers.utils.formatUnits(MINT_VALUE)} tokens to 
    the address ${acc1.address} at block ${mintTxReceipt.blockNumber}\n`);

    //get the votes power
    const votingPower = await myERC20VotesContract.getVotes(acc1.address);
    console.log(`Account ${acc1.address} has voting power of ${ethers.utils.formatUnits(votingPower)}`);

    //delegate
    const delegateTx = await myERC20VotesContract.connect(acc1).delegate(acc1.address);
    await delegateTx.wait();
    
    //delpy ballot
    const lastBlock = await ethers.provider.getBlock("latest")
    const ballotContract = await ballotcontratFactory.deploy(proposalNamesBytes32,
        myERC20VotesContract.address,
        lastBlock.number);      
    const deployRxReceipt = await ballotContract.deployTransaction.wait();
    console.log(`The contract was deployed at address
    ${ballotContract.address} at the block ${deployRxReceipt.blockNumber}\n`);

    const votingPower2 = await ballotContract.votingPower(acc1.address);
    console.log(`Account ${acc1.address} has voting power of ${ethers.utils.formatUnits(votingPower2)}`);
    
    //vote
    const voteTx = await ballotContract.connect(acc1).vote(1,ethers.utils.parseUnits("5"));
    await voteTx.wait();
    const votesAfter = await ballotContract.votingPower(acc1.address);
    console.log(`Account ${acc1.address} has voting power of ${ethers.utils.formatUnits(votesAfter)} after vote`);

    //result
    const resultTx = await ballotContract.winnerName();
    console.log(`Winner is ${ethers.utils.parseBytes32String(resultTx)}`);

}

main().catch((err) =>{
    console.error(err);
    process.exitCode = 1;
})