const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChainAndStaking
} = require('./contractPrompt.js');

const onePercent = ethers.BigNumber.from('10000000000000000');

const DEFAULT_PROOFCHAIN_ADDRESS = "0x4f2E285227D43D9eB52799D0A28299540452446E";
const DEFAULT_STAKING_ADDRESS = "0x8eBbA081291B908096D19f6614Df041C95fc4469";
const DEFAULT_VALIDATOR_ADDRESS = "0xDBB49bEebA5ec0bb0C46848054C2f43F38AB0A88";
const DEFAULT_COMMISSION_RATE = 10; // use onePercent

const DEFAULT_VALUES = [DEFAULT_VALIDATOR_ADDRESS, DEFAULT_COMMISSION_RATE];
const VALUE_NAMES = ["validator address", "commission rate (1-100)%"];

async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChainAndStaking(
        owner,
        "Adding new Validator",
        DEFAULT_STAKING_ADDRESS,
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [validatorAddress, commissionRate] = result.values;

        let validatorId = (await result.staking.getMetadata())._validatorsN;
        console.log("Adding new validator...");
        await result.proofChain.connect(owner).addValidator(validatorAddress, onePercent.mul(ethers.BigNumber.from(commissionRate)));
        console.log();
        console.log('Added new validator instance');
        console.log('Validator id: ', validatorId);
        console.log('Validator address: ', validatorAddress);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });