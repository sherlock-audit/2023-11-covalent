const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const BSP_SESSION_DURATION = 0

const DEFAULT_VALUES = [BSP_SESSION_DURATION];
const VALUE_NAMES = ["block specimen session duration in blocks"];


async function main() {
    const [_, owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "adding new Validator",
        "0xA12894440A0a1bAB19e6236fbC0625bcBeF963EA",
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [bspSessionDuration] = result.values;
        const proofChain = result.proofChain

        console.log('Old session duration in blocks: ', (await proofChain.getMetadata()).blockSpecimenSessionDuration);

        await proofChain.connect(owner).setBlockSpecimenSessionDuration(bspSessionDuration)

        await sleep(20000)

        console.log('New session duration in blocks: ', (await proofChain.getMetadata()).blockSpecimenSessionDuration);

        console.log();
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });