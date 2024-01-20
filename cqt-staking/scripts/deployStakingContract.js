const { ethers } = require('hardhat');
const {
    oneToken,
    getCQTAddressOnCurrentNetwork
} = require('../test/fixtures.js');

const {
    confirmInputsWithCQT
} = require('./contractPrompt.js');



const DELEGATOR_COOLDOWN = 191996 //6857 * 1;
const VALIDATOR_COOLDOWN = 1234260 //6857 * 1;
const MAX_CAP_MULTIPLIER = 0;
const VALIDATOR_MAX_STAKE = 70000;
const DEFAULT_CQT_ADDRESS = getCQTAddressOnCurrentNetwork();


const DEFAULT_VALUES = [
    DELEGATOR_COOLDOWN,
    VALIDATOR_COOLDOWN,
    MAX_CAP_MULTIPLIER,
    VALIDATOR_MAX_STAKE
];
const VALUE_NAMES = ["delegator cooldown", "validator cooldown", "max cap multiplier", "validator max stake, unscaled (if 1 is entered it will be scaled to 10^18)"];

async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithCQT(
        owner,
        "deploying OperationalStaking",
        DEFAULT_CQT_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    console.log("DEFAULT_CQT_ADDRESS", DEFAULT_CQT_ADDRESS)

    if (result.confirmed) {
        const [
            delegatorCoolDown,
            validatorCoolDown,
            maxCapMultiplier,
            validatorMaxStakeCap,
        ] = result.values;
        const cqt = result.cqt;

        console.log("DEFAULT_CQT_ADDRESS", cqt.address)

        const staking = await ethers.getContractFactory('OperationalStaking', owner);
        const contract = await upgrades.deployProxy(
            staking, [
                cqt.address,
                delegatorCoolDown,
                validatorCoolDown,
                maxCapMultiplier,
                oneToken.mul(validatorMaxStakeCap),
            ], { initializer: 'initialize' },
        );
        const stakingContract = await contract.deployed();

        console.log();
        console.log('Staking Contract address: ', stakingContract.address);
        console.log('Contract owner address: ', owner.address);
        console.log(await stakingContract.getMetadata());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });