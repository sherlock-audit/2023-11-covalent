const { ethers } = require('hardhat');
const {
    getBspProofChainContract,
    getBrpProofChainContract
} = require('../test/fixtures.js');
const { confirmInputs } = require('../scripts/contractPrompt.js');

const DEFAULT_VALUES = ["bsp", "", "", 0];
const VALUE_NAMES = [
    "brp or bsp?",
    "proofchain address",
    "operator address",
    "validatorId"
]

async function main() {
    const [_, contractDeployer, scManager] = await ethers.getSigners();
    let result = await confirmInputs("adding operator", VALUE_NAMES, DEFAULT_VALUES);

    if (result.confirmed) {
        const [artifact, proofChainAddress, operatorAddress, validatorId] = result.values;

        if (artifact == "bsp") {
            let bspContract = await getBspProofChainContract(scManager, proofChainAddress);
            result = await bspContract.connect(contractDeployer).addBSPOperator(operatorAddress, validatorId);
        } else if (artifact == "brp") {
            let brpContract = await getBrpProofChainContract(scManager, proofChainAddress);
            result = await brpContract.connect(contractDeployer).addBRPOperator(operatorAddress, validatorId);
        } else {
            console.log("invalid artifact");
            exit(1);
        }
        console.log(await result.wait());
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
