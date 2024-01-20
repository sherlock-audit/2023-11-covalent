
const { ethers } = require('hardhat');

const {
    getStakingContractOnCurrentNetwork, oneToken
} = require("../test/fixtures");
const { BigNumber } = require('ethers');
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

const isValidator = (id, address, allValidatorsData) => {
    return allValidatorsData.addresses[id] == address;
};

async function main() {
    const [owner] = await ethers.getSigners();
    const stakingContract = await getStakingContractOnCurrentNetwork(owner);
    const validatorN = (await stakingContract.getMetadata())._validatorsN;


    let allValidatorsData = await stakingContract.getAllValidatorsMetadata();

    let header = [];

    for (var i = 0; i < validatorN; i++) {
        let perValidatorHeader = ['staked_' + i, 'rewards_' + i, 'commission_' + i];
        header = header.concat(perValidatorHeader);
    }
    console.log(header);
    const wSum = createCsvWriter({
        path: 'operators_data.csv',
        header: ["Address", "Sum balance", "Self Staked", "Delegated", "Rewards", "Unstaked, unredeemable", "Unstaked, redeemable"]
    });
    let data = [];

    for (let j = 0; j < allValidatorsData.addresses.length; j++) {
        let delegatorAddress = allValidatorsData.addresses[j];
        let sum = zero();
        let unstakedRedeemable = zero();
        let unstakedUnredeemable = zero();
        let rewards = zero();
        let selfStaked = zero();
        let delegated = zero();
        for (var i = 0; i < validatorN; i++) {
            const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i);
            for (var k = 0; k < delegatorData.unstakingAmounts.length; k++) {
                sum = sum.add(delegatorData.unstakingAmounts[k]);
                console.log(delegatorData.unstakingsEndEpochs[k]);
                if (delegatorData.unstakingsEndEpochs[k].lt(2262490))
                    unstakedRedeemable = unstakedRedeemable.add(delegatorData.unstakingAmounts[k]);
                else
                    unstakedUnredeemable = unstakedUnredeemable.add(delegatorData.unstakingAmounts[k]);

            }


            sum = sum.add(delegatorData.staked);
            sum = sum.add(delegatorData.rewards);
            sum = sum.add(delegatorData.commissionEarned);
            rewards = rewards.add(delegatorData.rewards);
            if (isValidator(i, delegatorAddress, allValidatorsData)) {
                console.log("Validator")
                selfStaked = selfStaked.add(delegatorData.staked);
            }
            else
                delegated = delegated.add(delegatorData.staked);
        }
        let row = [sum, selfStaked, delegated, rewards, unstakedUnredeemable, unstakedRedeemable];
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