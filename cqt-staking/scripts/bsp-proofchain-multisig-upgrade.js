const { ethers } = require('hardhat');

const proofChainAddress = '0x4f2E285227D43D9eB52799D0A28299540452446E'

async function main() {
    const ProofChainV2 = await ethers.getContractFactory("BlockSpecimenProofChain");
    console.log("Preparing proposal...");
    const proposal = await defender.proposeUpgrade(proofChainAddress, ProofChainV2, {unsafeSkipStorageCheck: true});
    console.log("Upgrade proposal created at:", proposal.url);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
