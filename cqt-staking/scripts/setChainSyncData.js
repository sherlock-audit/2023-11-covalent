const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";

const CHAIN_ID = 1;
const SECONDS_PER_BLOCK_TARGET_CHAIN = 1350; // source, ethereum
const SECONDS_PER_BLOCK_CURRENT_CHAIN = 1217; // sink, monbeam
const START_BLOCK_ON_TARGET_CHAIN = 17886853; // ethereum
const START_BLOCK_ON_CURRENT_CHAIN = 4186014; // moonbeam
const ALLOWED_THRESHOLD = 20571;
// const MAX_SUBMISSIONS = 2;
// const NTH_BLOCK = 1;

const DEFAULT_VALUES = [
    CHAIN_ID,
    SECONDS_PER_BLOCK_TARGET_CHAIN, SECONDS_PER_BLOCK_CURRENT_CHAIN,
    START_BLOCK_ON_TARGET_CHAIN, START_BLOCK_ON_CURRENT_CHAIN
];

// ALLOWED_THRESHOLD, MAX_SUBMISSIONS, NTH_BLOCK

const VALUE_NAMES = [
    "chain id",
    "seconds per block on target chain (ethereum)", "seconds per block on current chain (moonbeam)",
    "start block on target chain (ethereum)", "start block on current chain (moonbeam)"
];
//"allowed threshold", "max submissions per block height", "nth block"

async function main() {
    const [, owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "setting chain sync data",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [
            chainId,
            secondsPerBlockTargetChain, secondsPerBlockCurrentChain,
            startBlockTarget, startBlockCurrent,
        ] = result.values;
        const proofChain = result.proofChain
        result = await proofChain.connect(owner).setChainSyncData(chainId, startBlockTarget, startBlockCurrent, secondsPerBlockTargetChain, { gasLimit: 1000000 });
        console.log(await result.wait())
        result = await proofChain.connect(owner).setSecondsPerBlock(secondsPerBlockCurrentChain, { gasLimit: 1000000 });
        console.log(await result.wait());
        result = await proofChain.connect(owner).setMaxSubmissionsPerBlockHeight(1, 1);
        console.log(await result.wait());
        result = await proofChain.connect(owner).setNthBlock(1, 1);
        console.log(await result.wait())
        result = await proofChain.connect(owner).setBlockHeightSubmissionsThreshold(1, ALLOWED_THRESHOLD);
        console.log(await result.wait());
        console.log(await proofChain.getChainData(chainId));

    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });