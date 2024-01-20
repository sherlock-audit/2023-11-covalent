const { ethers } = require('hardhat');

const proofChainAddress = '0x254E3FA072324fa202577F24147066359947bC23'

async function main() {
    const ProofChainV2 = await ethers.getContractFactory("BlockResultProofChain");
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
