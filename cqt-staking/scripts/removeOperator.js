const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const DEFAULT_PROOFCHAIN_ADDRESS = "0x06A38f70c8e245e1cfe1b7d5ACa1B7cd29380343";
const DEFAULT_OPERATOR_ADDRESS = "0x08016745eC3Fd007408a67741E583F7b3836dB4C";

const DEFAULT_VALUES = [DEFAULT_OPERATOR_ADDRESS];
const VALUE_NAMES = ["operator address"];

async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Removing operator instance",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [operatorAddress] = result.values;
        const proofChain = result.proofChain;
        console.log(owner.address);
        await result.proofChain.connect(owner).removeBRPOperator(operatorAddress, { gasLimit: 1000000 });
        console.log('Removed operator');
        console.log('All operators:')
        console.log(await proofChain.getAllOperators());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });