const { ethers } = require('hardhat');
//EXECUTE WITH CARE - PRODUCTION VALUES 
const proofChainAbi = require('../generated-abis/ugly/ProofChain.json');
const ProofChainAddress = '0x4f2E285227D43D9eB52799D0A28299540452446E';

async function getProofChainContract(signer) {
    return new ethers.Contract(ProofChainAddress, proofChainAbi, signer);
}


async function main() {
    const [owner] = await ethers.getSigners();
    const proofChainContract = await getProofChainContract(owner);

    console.log("Current owner of Proof-Chain contract: ", (await proofChainContract.owner()));

    const newOwner = ''; //valid new owner address
    await proofChainContract.connect(owner).transferOwnership(newOwner);

    await sleep(40000) // wait 40 seconds to mine the transaction

    console.log("New owner of Proof-Chain contract: ", (await proofChainContract.owner()));

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });