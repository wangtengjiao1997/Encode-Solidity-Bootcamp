import {ethers} from "ethers";
import { MyContract__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
import * as orJosn from "../artifacts/contracts/ReadOracle.sol/MyContract.json";
dotenv.config()


function setupProvider(){
    const provider = new ethers.providers.AlchemyProvider(
        "maticmum",
        process.env.ALCHEMY_API_KEY
    );
    return provider;
}

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    const provider = setupProvider();
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance<0.01){
        throw new Error("Not enough ether");
    }
    const contractFactory = new MyContract__factory(signer);
    const contract = await contractFactory.deploy("0xD9157453E2668B2fc45b7A803D3FEF3642430cC0");
    await contract.deployed();
    console.log("contract deployed");
    const deployTxReceipt = await contract.deployTransaction.wait();
    console.log(`hash is : ${deployTxReceipt.blockHash}`)
    const lastRead = await contract.getBtcSpotPrice();
    console.log("Last price:");
    console.log(ethers.utils.formatUnits(lastRead));

    const oracleContract = new ethers.Contract("0x786786a99e181488499935374d98ecd2d89ec30b", orJosn.abi, provider);
    const price = await oracleContract.getBtcSpotPrice();
    console.log(`Lastssss price: ${price}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });