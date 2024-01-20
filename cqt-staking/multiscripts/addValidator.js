const { ethers } = require('hardhat');
const {
    getStakingContract,
} = require('../test/fixtures.js');
const { confirmInputs } = require('../scripts/contractPrompt.js');


const onePercent = ethers.BigNumber.from('10000000000000000');

const DEFAULT_VALUES = ["", 0, 10];
const VALUE_NAMES = [
    "staking address",
    "validatorId",
    "commissionRate"
]

async function main() {
    const [cqtOwner, contractDeployer, scManager, v1, op1_1, op1_2, v2, op2_1, v_bak, v3] = await ethers.getSigners();
    let result = await confirmInputs("add validator", VALUE_NAMES, DEFAULT_VALUES);
    if (result.confirmed) {
        const [stakingAddress, validatorId, commissionRate] = result.values;

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
        let scaledAmount = onePercent.mul(ethers.BigNumber.from(commissionRate));
        result = await contract.connect(scManager).addValidator(validator.address, scaledAmount);
        console.log(await result.wait());
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


