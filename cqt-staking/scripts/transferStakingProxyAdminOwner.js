const hre = require('hardhat');
const { ethers } = require('hardhat');

const stakingAbi = require('../generated-abis/ugly/OperationalStaking.json');
const StakingAddress = '0x8eBbA081291B908096D19f6614Df041C95fc4469';


async function getStakingContract(signer) {
    return new ethers.Contract(StakingAddress, stakingAbi, signer);
}


async function main() {
    const [owner] = await ethers.getSigners();

    const stakingContract = await getStakingContract(owner);

    const adminAdress = await upgrades.erc1967.getAdminAddress(stakingContract.address)

    // we only need transferOwnership function for ProxyAdmin so using stakingAbi works fine
    const adminContract = new ethers.Contract(adminAdress, stakingAbi, owner);

    console.log("Current ProxyAdmin owner: ", await adminContract.owner())

    const newOwner = '' //valid new owner address
    await adminContract.connect(owner).transferOwnership(newOwner)

    console.log("New ProxyAdmin owner: ", await adminContract.owner())

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });