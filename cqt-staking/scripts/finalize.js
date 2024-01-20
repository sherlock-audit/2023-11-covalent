const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const DEFAULT_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";

const CHAIN_ID = 1;
const BLOCK_HEIGHT = 17919125;


const DEFAULT_VALUES = [CHAIN_ID, BLOCK_HEIGHT];
const VALUE_NAMES = ["chain id", "block height"];


async function main() {
    const [owner, v1, v2, v3] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Finalizing block specimen session",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [chainId, blockHeight] = result.values;

        await result.proofChain.connect(v3).finalizeAndRewardResultSession(chainId, blockHeight);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });