const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');

const DEFAULT_PROOFCHAIN_ADDRESS = "";

const STAKING_ADDRESS = "";

const DEFAULT_VALUES = [STAKING_ADDRESS];
const VALUE_NAMES = ["staking address"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting Staking addresss on ProofChain",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [stakingAddress] = result.values;

        await result.proofChain.connect(owner).setStakingInterface(stakingAddress)

        await sleep(20000);

        console.log(await result.proofChain.getMetadata());
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });