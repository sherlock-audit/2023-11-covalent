

const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "";

const CHAIN_ID = 1;
const THRESHOLD = 100;

const DEFAULT_VALUES = [CHAIN_ID, THRESHOLD];
const VALUE_NAMES = ["chain id", "submissions threshold"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting block height submissions threshold",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [chainId, theshold] = result.values;
        await result.proofChain.connect(owner).setBlockHeightSubmissionsThreshold(chainId, theshold)
        await sleep(20000);
        console.log(await result.proofChain.getChainData(chainId));
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });