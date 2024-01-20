const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChainAndStaking
} = require('./contractPrompt.js');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const DEFAULT_STAKING_ADDRESS = "0x8eBbA081291B908096D19f6614Df041C95fc4469";
const DEFAULT_PROOFCHAIN_ADDRESS = "0x4f2E285227D43D9eB52799D0A28299540452446E";

const DEFAULT_VALUES = [];
const VALUE_NAMES = [];

const writeRecords = async(data, writer) => {
    await writer
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'))
        .catch((err) => {
            console.log('Save failed', err);
        });
};


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChainAndStaking(
        owner,
        "Getting validators data",
        DEFAULT_STAKING_ADDRESS,
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const writer = createCsvWriter({
            path: 'all_validators_data.csv',
            header: ["id", "validator address", "staked", "delegated", "commission rate", "Total Staked", "Rewards Earned"]
        });

        const proofChain = result.proofChain;
        const stakingContract = result.staking;

        const validatorN = (await stakingContract.getMetadata())._validatorsN;
        let rows = []
        for (var i = 0; i < validatorN; i++) {
            console.log();
            console.log("Validator id: ", i);
            let v = await stakingContract.getValidatorMetadata(i)
            console.log(v);
            console.log("Operators: ");
            console.log(await proofChain.getOperators(i));
            rows = rows.concat([
                [i, v._address, v.staked.toString(), v.delegated.toString(), v.commissionRate.toString()]
            ]);
        }
        console.log(rows)
        await writeRecords(rows, writer);

    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });