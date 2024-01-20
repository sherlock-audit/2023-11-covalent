const { ethers } = require('hardhat');

const DEFAULT_STAKING_ADDRESS = "";

const VALIDATOR_MAX_CAP_MULTIPLIER = 0;

const DEFAULT_VALUES = [VALIDATOR_MAX_CAP_MULTIPLIER];
const VALUE_NAMES = ["validator max cap multiplier"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting validator max cap multiplier",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [multiplier] = result.values;

        await result.staking.connect(owner).setMaxCapMultiplier(multiplier);

        await sleep(20000);

        console.log(await result.staking.getMetadata());
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });