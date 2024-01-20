const { ethers } = require('hardhat');
const {
    confirmInputsWithStaking
} = require('./contractPrompt.js');

const DEFAULT_STAKING_ADDRESS = "0x8eBbA081291B908096D19f6614Df041C95fc4469";

const DEFAULT_VALUES = [];
const VALUE_NAMES = [];

async function main() {
    const [owner] = await ethers.getSigners();

    let result = await confirmInputsWithStaking(
        owner,
        "Getting staking metadata",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const stakingContract = result.staking;
        console.log(await stakingContract.getMetadata())
        console.log("Owner:")
        console.log(await stakingContract.owner())
        console.log(owner.address)
    }

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });