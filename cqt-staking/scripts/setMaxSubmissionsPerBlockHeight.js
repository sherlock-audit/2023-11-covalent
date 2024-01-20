const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";

const CHAIN_ID = 1;
const MAX_SUBMISSIONS = 2;

const DEFAULT_VALUES = [
    CHAIN_ID,
    MAX_SUBMISSIONS
];

const VALUE_NAMES = [
    "chain id",
    "max submissions"
];


async function main() {
    const [owner] = await ethers.getSigners();
    console.log(owner.address)
        // await sleep(2000000)
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
            maxSubmissions
        ] = result.values;
        const proofChain = result.proofChain;
        await proofChain.connect(owner).setMaxSubmissionsPerBlockHeight(chainId, maxSubmissions, { gasLimit: 1000000 });
        await sleep(20000);
        console.log(await proofChain.getChainData(chainId));

    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });