const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const DEFAULT_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";
const DEFAULT_OPERATOR_ADDRESS = "0x7a3c7F302A4d22DA3366b982182Accd66415dF3E";
const DEFAULT_VALIDATOR_ID = 10;

const DEFAULT_VALUES = [DEFAULT_VALIDATOR_ID, DEFAULT_OPERATOR_ADDRESS];
const VALUE_NAMES = ["validator id", "operator address"];

async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Adding new Operator to existing Validator",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [validatorId, operatorAddress] = result.values;
        console.log("Adding a new operator to ProofChain...");
        await result.proofChain.connect(owner).addBRPOperator(operatorAddress, validatorId);
        console.log('Added new operator instance:');
        console.log("ProofChain address: ", result.proofChain.address);
        console.log('Validator id: ', validatorId);
        console.log('Operator address: ', operatorAddress);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });