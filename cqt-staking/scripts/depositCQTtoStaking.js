const { ethers } = require('hardhat');
const {
    oneToken,
    getCQTAddressOnCurrentNetwork,
    sleep
} = require('../test/fixtures.js');

const {
    confirmInputsWithStakingAndCQT
} = require('./contractPrompt.js');


const DEFAULT_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";
const DEFAULT_CQT_ADDRESS = "0xBE4C130aaFf02Ee7c723351b7D8C2B6da1D22ebd";
const DEFAULT_DEPOSIT_AMOUNT = 91730;

const DEFAULT_VALUES = [DEFAULT_DEPOSIT_AMOUNT];
const VALUE_NAMES = ["CQT amount, unscaled (if 1 is entered it will be scaled to 10^18"];

async function main() {
    const [owner] = await ethers.getSigners();

    let result = await confirmInputsWithStakingAndCQT(
        owner,
        "depositing CQT to OperationalStaking",
        DEFAULT_STAKING_ADDRESS,
        DEFAULT_CQT_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [amountToDeposit] = result.values;
        const scaledAmountToDeposit = oneToken.mul(amountToDeposit);
        // await result.cqt.connect(owner).approve(result.staking.address, scaledAmountToDeposit);
        // await sleep(50000); // 25 seconds so the block is mined
        await result.staking.depositRewardTokens(scaledAmountToDeposit);
        await sleep(50000);
        console.log((await result.staking.getMetadata())._rewardPool);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });