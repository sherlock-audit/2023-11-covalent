const { ethers } = require('hardhat');
//EXECUTE WITH CARE - PRODUCTION VALUES
const stakingAbi = require('../generated-abis/ugly/OperationalStaking.json');
const StakingAddress = '0x8eBbA081291B908096D19f6614Df041C95fc4469';

async function getStakingContract(signer) {
    return new ethers.Contract(StakingAddress, stakingAbi, signer);
}

async function main() {
    const [owner] = await ethers.getSigners();
    const stakingContract = await getStakingContract(owner);

    console.log("Current owner of Staking contract: ", (await stakingContract.owner()));

    const newOwner = ''; //valid new owner address
    await stakingContract.connect(owner).transferOwnership(newOwner);

    await sleep(40000) // wait 40 seconds to mine the transaction

    console.log("New owner of Staking contract: ", (await stakingContract.owner()));

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });