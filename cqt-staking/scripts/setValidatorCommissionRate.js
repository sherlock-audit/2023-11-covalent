const { ethers } = require('hardhat');
const {
    confirmInputsWithStaking
} = require('./contractPrompt.js');

const {
    sleep
} = require('../test/fixtures.js');

const DEFAULT_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";

const VALIDATOR_ID = 0;
const VALIDATOR_COMMISSION_RATE = 10; // ethers.BigNumber.from('10000000000000000');

const DEFAULT_VALUES = [VALIDATOR_ID, VALIDATOR_COMMISSION_RATE];
const VALUE_NAMES = ["validator id", "scaled validator commission rate (1 - 10^18)"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithStaking(
        owner,
        "Setting validator commission rate",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [validatorId, rateStr] = result.values;

        const rate = ethers.BigNumber.from(rateStr);
        console.log(rate)

        await result.staking.connect(owner).setValidatorCommissionRate(validatorId, rate);

        await sleep(20000);

        console.log(await result.staking.getValidatorMetadata(validatorId));
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });