
const { ethers } = require('hardhat');

const {
    getStakingContractOnCurrentNetwork, oneToken
} = require("../test/fixtures");
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const zero = () => ethers.BigNumber.from(0);

const getAddress = async () => {
    const filename = "./scripts/delegators.csv";
    var addresses = require("fs").readFileSync(filename, "utf8");
    addresses = addresses.replaceAll('"', '');
    addresses = addresses.split("\n");
    return addresses;
};

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
    let md = await stakingContract.getMetadata()
    const validatorN = md._validatorsN;

    let ds = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, d1, d2, d3, d4, d5, d6, d7]

    const addresses = ds.map(d => d.address);

    const wSum = createCsvWriter({
        path: 'delegators_after_migration_summary_zero.csv',
        header: ["Address", "Sum balance", "Rewards", "Unstaked, unredeemable", "Unstaked, redeemable"]
    });
    let data = [];
    let total = zero()

    for (let j = 0; j < addresses.length; j++) {
        let delegatorAddress = addresses[j];
        let sum = zero();
        let unstakedRedeemable = zero();
        let unstakedUnredeemable = zero();
        let rewards = zero();
        for (var i = 0; i < validatorN; i++) {
            const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i);
            for (var k = 0; k < delegatorData.unstakingAmounts.length; k++) {
                sum = sum.add(delegatorData.unstakingAmounts[k]);
                // console.log(delegatorData.unstakingsEndEpochs[k]);
                if (delegatorData.unstakingsEndEpochs[k].lt(2262490))
                    unstakedRedeemable = unstakedRedeemable.add(delegatorData.unstakingAmounts[k]);
                else
                    unstakedUnredeemable = unstakedUnredeemable.add(delegatorData.unstakingAmounts[k]);
            }

            sum = sum.add(delegatorData.staked);
            sum = sum.add(delegatorData.rewards);
            sum = sum.add(delegatorData.commissionEarned);
            rewards = rewards.add(delegatorData.rewards);
            console.log(delegatorData.rewards)
        }

        let row = [sum, rewards, unstakedUnredeemable, unstakedRedeemable];
        total = total.add(sum)
        row = row.map(val => val.toString());
        row = [delegatorAddress].concat(row);
        data.push(row);

    }
    let row = ["reward pool", md._rewardPool.toString(), 0,0,0]
    data.push(row)
    total = total.add( md._rewardPool)
    let totalSum = ["total sum", total.toString(), 0,0,0]
    data.push(totalSum)
    console.log(data);

    // await writeRecords(data, wSum);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });