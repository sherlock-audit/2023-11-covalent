const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');


const BSP_REWARD = 0;

const DEFAULT_VALUES = [BSP_REWARD];
const VALUE_NAMES = ["Block Specimen Reward"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Setting block specimen reward",
        PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [bspRewardStr] = result.values;
        const reward = ethers.BigNumber.from(bspRewardStr);
        const proofChain = result.proofChain;

        await proofChain.connect(owner).setBlockSpecimenReward(reward);

        await sleep(20000);

        console.log(await proofChain.getBSPRoleData());
        console.log();
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });