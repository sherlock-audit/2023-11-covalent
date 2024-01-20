
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
    const [owner] = await ethers.getSigners();
    let blockNumber = 2523595
    const stakingContract = await getStakingContractOnCurrentNetwork(owner);
    const validatorN = (await stakingContract.getMetadata({ blockNumber: blockNumber }))._validatorsN;

    const addresses = await getAddress();
    let header = [];

    for (var i = 0; i < validatorN; i++) {
        let perValidatorHeader = ['staked_' + i, 'rewards_' + i, 'commission_' + i];
        header = header.concat(perValidatorHeader);
    }
    console.log(header);
    const wSum = createCsvWriter({
        path: 'delegators_summary.csv',
        header: ["Address", "Sum balance", "Rewards", "Unstaked, unredeemable", "Unstaked, redeemable"]
    });
    let data = [];


    for (let j = 0; j < addresses.length; j++) {
        let delegatorAddress = addresses[j];
        let sum = zero();
        let unstakedRedeemable = zero();
        let unstakedUnredeemable = zero();
        let rewards = zero();
        for (var i = 0; i < validatorN; i++) {
            const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i, { blockNumber: blockNumber });
            for (var k = 0; k < delegatorData.unstakingAmounts.length; k++) {
                sum = sum.add(delegatorData.unstakingAmounts[k]);
                console.log(delegatorData.unstakingsEndEpochs[k]);
                if (delegatorData.unstakingsEndEpochs[k].lt(blockHeight))
                    unstakedRedeemable = unstakedRedeemable.add(delegatorData.unstakingAmounts[k]);
                else
                    unstakedUnredeemable = unstakedUnredeemable.add(delegatorData.unstakingAmounts[k]);

            }


            sum = sum.add(delegatorData.staked);
            sum = sum.add(delegatorData.rewards);
            sum = sum.add(delegatorData.commissionEarned);
            rewards = rewards.add(delegatorData.rewards);
        }
        let row = [sum, rewards, unstakedUnredeemable, unstakedRedeemable];
        row = row.map(val => val.div(oneToken).toString());
        row = [delegatorAddress].concat(row);
        data.push(row);

    }
    console.log(data);

    await writeRecords(data, wSum);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });