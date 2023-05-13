import { ethers } from "hardhat";
import { MyERC20Votes__factory } from "../typechain-types";

const MINT_VALUE  = ethers.utils.parseUnits("10");

async function main() {
    const [deployer, acc1, acc2] = await ethers.getSigners();
    const contratFactory = new MyERC20Votes__factory(deployer); 
    const contract = await contratFactory.deploy();
    const deployRxReceipt = await contract.deployTransaction.wait();
    console.log(`The contract was deployed at address
    ${contract.address} at the block ${deployRxReceipt.blockNumber}\n`);
    const mintTx = await contract.mint(acc1.address, MINT_VALUE);
    const mintTxReceipt = await mintTx.wait();
    console.log(`Minted ${ethers.utils.formatUnits(MINT_VALUE)} tokens to 
    the address ${acc1.address} at block ${mintTxReceipt.blockNumber}\n`);
    
    const balanceBN = await contract.balanceOf(acc1.address);
    console.log(`Account ${acc1.address} has 
    ${ethers.utils.formatUnits(balanceBN)} Mytokens\n`);

    const votes = await contract.getVotes(acc1.address);
    console.log(`Account ${acc1.address} has
     ${ethers.utils.formatUnits(votes)} votes before self delegating\n`);

    const delegateTx = await contract.connect(acc1).delegate(acc1.address);
    const rec = await delegateTx.wait();
    console.log(`delegate receipt in block ${rec.blockNumber} \n`);
    const votesAfter = await contract.getVotes(acc1.address);

    console.log(`Account ${acc1.address} has
     ${ethers.utils.formatUnits(votesAfter)} votes after self delegating at block ${}\n`);

    const tranferTx = await contract.connect(acc1)
    .transfer(acc2.address, MINT_VALUE.div(2));
    await tranferTx.wait();
    const votes1AfterTransfer = await contract.getVotes(acc1.address);

    console.log(`Account ${acc1.address} has
    ${ethers.utils.formatUnits(votes1AfterTransfer)} votes after transfer\n`);

    const votes2AfterTransfer = await contract.getVotes(acc2.address);
    console.log(`Account ${acc2.address} has
    ${ethers.utils.formatUnits(votes2AfterTransfer)} votes after transfer\n`);

    const lastBlock = await ethers.provider.getBlock("latest")
    console.log(`Current block number is ${lastBlock.number} \n`)
     
    let pastVotes = await contract.getPastVotes(acc1.address, lastBlock.number-1);
    console.log(
       `Currently at block ${lastBlock.number}\n` 
    );
    
}

main().catch((err) =>{
    console.error(err);
    process.exitCode = 1;
})