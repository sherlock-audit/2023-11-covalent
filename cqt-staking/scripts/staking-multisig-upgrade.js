const { ethers } = require('hardhat');

const stakingAddress = process.env.MOONBEAM_ALPHA_STAKING_ADDRESS

async function main() {
    const OperationalStakingV2 = await ethers.getContractFactory("OperationalStaking");
    console.log("Preparing proposal...");
    const proposal = await defender.proposeUpgrade(stakingAddress, OperationalStakingV2);
    console.log("Upgrade proposal created at:", proposal.url);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });