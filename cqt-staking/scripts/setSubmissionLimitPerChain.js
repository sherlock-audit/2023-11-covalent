const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const DEFAULT_PROOFCHAIN_ADDRESS = "";

const CHAIN_ID = 1;
const LIMIT = 35;

const DEFAULT_VALUES = [CHAIN_ID, LIMIT];
const VALUE_NAMES = ["chain id", "submissions limit per session"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting submissions limit per chain",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [chainId, limit] = result.values;

        // let blocksPerDay = 6500 // on the chain for which BSP is generated
        // let submissionsThreshold = 2.25
        // let nthBlock = 3
        // let maxSubmissions = 5

        // let maxHashesPer24H = Math.round((blocksPerDay / nthBlock) * submissionsThreshold)

        await result.proofChain.connect(owner).setMaxSubmissionsPerBlockHeight(chainId, limit)

        console.log('Current block: ', await ethers.provider.getBlockNumber());
        console.log('Proofchain Contract address: ', result.proofChain.address);
        console.log('Contract owner address: ', owner.address);
        // console.log('Max submissions per day: ', maxHashesPer24H);

    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });