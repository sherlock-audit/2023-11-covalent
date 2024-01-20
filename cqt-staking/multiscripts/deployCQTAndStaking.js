// deploy CQT and staking contract on localhost (npx hardhat node) or sepolia

const hre = require("hardhat");
var prompt = require('prompt');
const {
    oneToken,
    getCQTAddressOnCurrentNetwork
} = require('../test/fixtures.js');

const {
    confirmInputsWithCQT
} = require('../scripts/contractPrompt.js');

// take --network input from command line

const DELEGATOR_COOLDOWN = 191996 //6857 * 1;
const VALIDATOR_COOLDOWN = 1234260 //6857 * 1;
const MAX_CAP_MULTIPLIER = 0;
const VALIDATOR_MAX_STAKE = 70000;
const DEFAULT_VALUES = [
    DELEGATOR_COOLDOWN,
    VALIDATOR_COOLDOWN,
    MAX_CAP_MULTIPLIER,
    VALIDATOR_MAX_STAKE
];
const VALUE_NAMES = ["delegator cooldown", "validator cooldown", "max cap multiplier", "validator max stake, unscaled (if 1 is entered it will be scaled to 10^18)"];
const NAME = 'CovalentQueryTokenFaucet';
const SYMBOL = 'CQT';
const MAX_SUPPLY = BigInt(1000000000000000000000000000);



async function deployCQT() {
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);
    console.log('Account balance:', (await deployer.getBalance()).toString());

    const CQTFaucet = await hre.ethers.getContractFactory('CovalentQueryTokenFaucet', deployer);
    const cqtFaucet = await CQTFaucet.deploy(NAME, SYMBOL, MAX_SUPPLY);
    await cqtFaucet.deployed();

    console.log('cqtFaucet deployed to:', cqtFaucet.address);

    return cqtFaucet.address;
}

async function deployStaking(cqtaddress) {
    const [, owner] = await ethers.getSigners(); // using second account as owner
    let result = await confirmInputsWithCQT(
        owner,
        "deploying OperationalStaking",
        cqtaddress,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    //console.log("DEFAULT_CQT_ADDRESS", DEFAULT_CQT_ADDRESS)

    if (result.confirmed) {
        const [
            delegatorCoolDown,
            validatorCoolDown,
            maxCapMultiplier,
            validatorMaxStakeCap,
        ] = result.values;
        const cqt = result.cqt;

        console.log("cqtaddress0", cqtaddress);
        console.log("cqtaddress", cqt.address);
        console.log("owner", owner.address);

        const staking = await ethers.getContractFactory('OperationalStaking', owner);
        const contract = await upgrades.deployProxy(
            staking, [
                cqt.address,
                delegatorCoolDown,
                validatorCoolDown,
                maxCapMultiplier,
                oneToken.mul(validatorMaxStakeCap),
            ], { initializer: 'initialize', from: owner.address},
        );
        const stakingContract = await contract.deployed();

        console.log();
        console.log('Staking Contract address: ', stakingContract.address);
        console.log('Contract owner address: ', owner.address);
        console.log(await stakingContract.getMetadata());
        console.log(await stakingContract.owner());

        return stakingContract;
    }
}

async function setStakingManager(stakingContract, stakingContractOwner, stakingManager) {
    await stakingContract.setStakingManagerAddress(stakingManager.address, {from: stakingContractOwner.address})
    console.log("Staking Manager Address Set to (and intention was to set to): ", await stakingContract.stakingManager(), stakingManager.address);
}

async function addValidator(stakingContract, stakingManager, validator1) {
    const SCAbi = require("../generated-abis/ugly/OperationalStaking.json")
    SC_sm = new ethers.Contract(stakingContract.address, SCAbi, stakingManager);
    console.log("adding validator:", await SC_sm.addValidator(validator1.address, ethers.BigNumber.from("100000000000000000")));
    console.log("validator state:", await SC_sm.getValidatorMetadata(0))
}

async function main() {
    const [cqtowner, contractDeployer, stakingManager, validator1] = await ethers.getSigners();

    //cqtaddress = await deployCQT();
    cqtaddress = "0x6e5D4f0835fD85e6b28143C66651699400c6A099"

    stakingContract = await deployStaking(cqtaddress);
    await setStakingManager(stakingContract, contractDeployer, stakingManager);
    //await addValidator(stakingContract, stakingManager, validator1)
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });