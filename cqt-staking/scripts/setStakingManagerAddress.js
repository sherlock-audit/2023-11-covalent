const { ethers } = require('hardhat');
const {
    confirmInputsWithStaking
} = require('./contractPrompt.js');
const DEFAULT_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";

const STAKING_MANAGER = "0xf28B9091AAe6471c016dF2d769c22e0Da97353ec"; // proofchain address

const DEFAULT_VALUES = [STAKING_MANAGER];
const VALUE_NAMES = ["Staking manager address (ProofChain address)"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithStaking(
        owner,
        "Setting staking manager address",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [stakingManagerAddress] = result.values;
        await result.staking.connect(owner).setStakingManagerAddress(stakingManagerAddress);
        console.log(await result.staking.getMetadata());
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });