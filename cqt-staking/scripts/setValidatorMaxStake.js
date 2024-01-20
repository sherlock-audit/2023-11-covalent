const { ethers } = require('hardhat');

const DEFAULT_STAKING_ADDRESS = "";

const VALIDATOR_MAX_STAKE = 0;

const DEFAULT_VALUES = [VALIDATOR_MAX_STAKE];
const VALUE_NAMES = ["validator max stake, unscaled (if 1 is entered it will scale to 10^18)"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting validator max stake",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [rate] = result.values;

        await result.staking.connect(owner).setValidatorMaxStake(oneToken.mul(rate));

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