const { ethers } = require('hardhat');
const {
    confirmInputsWithStaking
} = require('./contractPrompt.js');
const DEFAULT_STAKING_ADDRESS = "";

const STAKING_MANAGER = ""; // proofchain address

const DEFAULT_VALUES = [STAKING_MANAGER];
const VALUE_NAMES = ["Staking manager address (ProofChain address)"];

const oneToken = ethers.BigNumber.from('1000000000000000000');

async function main() {
    const [owner] = await ethers.getSigners();
    const reward = oneToken.mul(40);
    let result = await confirmInputsWithStaking(
        owner,
        "Setting staking manager address",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    let vs = [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14];
    let rewards = [10, 20, 14, 5, 11, 22, 17, 6, 20, 8, 15, 10, 12];
    rewards = rewards.map(r => oneToken.mul(r));

    if (result.confirmed) {
        const [stakingManagerAddress] = result.values;
        await result.staking.connect(owner).rewardValidators(vs, rewards);
        await result.staking.connect(owner).rewardValidators(vs, rewards);
        rewards = rewards.map(r => r.sub(oneToken.mul(2)))
        await result.staking.connect(owner).rewardValidators(vs, rewards);
        await result.staking.connect(owner).rewardValidators(vs, rewards);

        // console.log(await result.staking.getMetadata());
    }

}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });