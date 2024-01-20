const { ethers } = require('hardhat');

const {
  confirmInputsWithProofChain
} = require('./contractPrompt.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "";

const DEFAULT_VALUES = [];
const VALUE_NAMES = [];


async function main() {
  const [owner] = await ethers.getSigners();
  let result = await confirmInputsWithProofChain(
    owner,
    "Upgrading ProofChain",
    DEFAULT_PROOFCHAIN_ADDRESS,
    VALUE_NAMES,
    DEFAULT_VALUES
  );

  if (result.confirmed) {
    const proofChain = result.proofChain;
    const newProofChain = await ethers.getContractFactory('ProofChain', owner);
    let newProofChainContract = await upgrades.upgradeProxy(proofChain.address, newProofChain);
    console.log('Proofchain upgraded to:', newProofChainContract.address);
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
