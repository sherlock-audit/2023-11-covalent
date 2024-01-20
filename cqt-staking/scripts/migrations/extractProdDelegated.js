
const { ethers } = require('hardhat');

const {
    getStakingContractOnCurrentNetwork, oneToken
} = require("../../test/fixtures");
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const zero = () => ethers.BigNumber.from(0);

const writeRecords = async (data, writer) => {
    await writer
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'))
        .catch((err) => {
            console.log('Save failed', err);
        });
};


async function main() {
    const [owner, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, d1, d2, d3, d4, d5, d6, d7] = await ethers.getSigners();
    const stakingContract = await getStakingContractOnCurrentNetwork(owner);
    let md = await stakingContract.getMetadata();
    console.log(md);
    const validatorN = md._validatorsN;

    let ds = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, d1, d2, d3, d4, d5, d6, d7];

    const wSum = createCsvWriter({
        path: 'delegations.csv',
        header: ["Id", "Staked", "Delegated", "Max Delegation", "Is disabled"]
    });
    let data = [];
    let totalDelegated = zero();
    let totalMaxAvailable = zero();

    let multiplier = md._maxCapMultiplier;

    for (var i = 0; i < validatorN; i++) {
        let vd = await stakingContract.getValidatorMetadata(i);
        const delegatorData = await stakingContract.getDelegatorMetadata(vd._address, i);
        let staked = delegatorData.staked;
        let delegated = vd.delegated;
        let maxDelegation = zero();

        totalDelegated = totalDelegated.add(delegated);
        if (vd.disabledAtBlock == 0) {
            maxDelegation = maxDelegation.add(staked.mul(multiplier));
            totalMaxAvailable = totalMaxAvailable.add(staked.mul(multiplier));
        }
        let row = [i, staked.div(oneToken), delegated.div(oneToken), maxDelegation.div(oneToken), vd.disabledAtBlock == 0];
        data.push(row);
    }

    let row = ["Total Delegated", totalDelegated.div(oneToken), 0];
    data.push(row);
    row = ["Total Max Available", totalMaxAvailable.div(oneToken), 0];
    data.push(row);
    row = ["Total Available", (totalMaxAvailable.sub(totalDelegated)).div(oneToken), 0];
    data.push(row);

    await writeRecords(data, wSum);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });