const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "";

const CHAIN_ID = 1;
const NTH_BLOCK = 35;

const DEFAULT_VALUES = [CHAIN_ID, NTH_BLOCK];
const VALUE_NAMES = ["chain id", "nth block"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "adding new Validator",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [minSubmissions] = result.values;
        await result.proofChain.connect(owner).setMinSubmissionsRequired(minSubmissions)

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