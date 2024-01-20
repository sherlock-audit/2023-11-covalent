
const { ethers } = require('hardhat');
const {
    oneToken,
    getCQTContractFromAddress,
    getBspProofChainContract,
    getBrpProofChainContract,
    getStakingContract
} = require('../test/fixtures.js');
const { confirmInputs } = require('../scripts/contractPrompt.js');

const DEFAULT_VALUES = ["", 0, 35000, "0x6e5D4f0835fD85e6b28143C66651699400c6A099"];
const VALUE_NAMES = [
    "staking address",
    "validatorId",
    "cqt amount",
    "cqt address"
]

async function main() {
    const [cqtOwner, , scManager, v1, _so, , v2, , , v3] = await ethers.getSigners();
    let result = await confirmInputs("staking", VALUE_NAMES, DEFAULT_VALUES);

    if (result.confirmed) {
        const [stakingAddress, validatorId, cqtAmount, cqtAddress] = result.values;

        let validator;
        if (validatorId == 0) {
            validator = v1;
        } else if (validatorId == 1) {
            validator = v2;
        } else if (validatorId == 2) {
            validator = v3;
        } else {
            console.log("invalid validatorId", validatorId);
            exit(1);
        }

        let contract = await getStakingContract(scManager, stakingAddress);

        let scaledAmount = oneToken.mul(ethers.BigNumber.from(cqtAmount));

        // approve
        console.log("approving...")
        const cqt = await getCQTContractFromAddress(cqtOwner, cqtAddress);
        result = await cqt.connect(validator).approve(contract.address, scaledAmount);
        console.log(await result.wait());

        // stake
        console.log("staking...")
        result = await contract.connect(validator).stake(validatorId, scaledAmount);
        console.log(await result.wait());
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
