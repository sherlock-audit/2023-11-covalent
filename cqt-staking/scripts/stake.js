const { ethers } = require('hardhat');
const {
    oneToken,
    getCQTAddressOnCurrentNetwork,
    sleep
} = require('../test/fixtures.js');

const {
    confirmInputsWithStakingAndCQT
} = require('./contractPrompt.js');

const STAKING_ABI = require("../generated-abis/ugly/OperationalStaking.json");
const DEFAULT_STAKING_ADDRESS = "0xF2f366c49d1512Fd03ECE4135b8Eb8D841D7Bce8";
const DEFAULT_BSP_STAKING_ADDRESS = "0x30F220B44E937dd6A2A43D91D564E259f3574eb8";
const DEFAULT_CQT_ADDRESS = "0x6e5D4f0835fD85e6b28143C66651699400c6A099";
const DEFAULT_DEPOSIT_AMOUNT = 70000;

const DEFAULT_VALUES = [DEFAULT_DEPOSIT_AMOUNT];
const VALUE_NAMES = ["CQT amount, unstaled (if 1 is entered it will be scaled to 10^18"];

async function main() {
    const [owner, deployer, manager, v1, op11, op12, v2, op21, vbak, v3] = await ethers.getSigners();

    let result = await confirmInputsWithStakingAndCQT(
        owner,
        "depositing CQT to OperationalStaking",
        DEFAULT_STAKING_ADDRESS,
        DEFAULT_CQT_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );

    const bspStaking = await new ethers.Contract(
        DEFAULT_BSP_STAKING_ADDRESS,
        STAKING_ABI,
        owner
    );

    if (result.confirmed) {
        // const [amountToDeposit] = result.values;
        const scaledAmountToDeposit = oneToken.mul(DEFAULT_DEPOSIT_AMOUNT);
        // console.log(result.staking.address)
        await result.cqt.connect(v2).approve(bspStaking.address, scaledAmountToDeposit);
        await sleep(50000); // 25 seconds so the block is mined
        console.log("staking amount %d with validator address %s", DEFAULT_DEPOSIT_AMOUNT, v2.address)
            // await sleep(50000)
        await bspStaking.connect(v2).stake(4, scaledAmountToDeposit, { gasLimit: 1000000 });
        // await result.staking.connect(v2).stake(1, scaledAmountToDeposit);
        await sleep(25000);
        console.log((await result.staking.getMetadata())._rewardPool);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });