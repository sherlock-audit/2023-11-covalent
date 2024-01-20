const { ethers } = require('hardhat');

const {
  confirmInputsWithStaking
} = require('./contractPrompt.js');


const DEFAULT_STAKING_ADDRESS = "";

const DEFAULT_VALUES = [];
const VALUE_NAMES = [];


async function main() {
  const [owner] = await ethers.getSigners();
  let result = await confirmInputsWithStaking(
    owner,
    "Upgrading staking",
    DEFAULT_STAKING_ADDRESS,
    VALUE_NAMES,
    DEFAULT_VALUES
  );
  if (result.confirmed) {
    const staking = result.staking;
    const newstaking = await ethers.getContractFactory('OperationalStaking', owner);
    let newstakingContract = await upgrades.upgradeProxy(stakingContract.address, newstaking);
    console.log('Staking upgraded to:', newstakingContract.address);
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
