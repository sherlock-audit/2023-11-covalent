
const { ethers } = require('hardhat');

const {
    getStakingContractOnCurrentNetwork, oneToken
} = require("../../test/fixtures");
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const zero = () => ethers.BigNumber.from(0);


async function main() {
    const [owner, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, d1, d2, d3, d4, d5, d6, d7] = await ethers.getSigners();
    const stakingContract = await getStakingContractOnCurrentNetwork(owner);
    const validatorN = (await stakingContract.getMetadata())._validatorsN;

    let ds = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, d1, d2, d3, d4, d5, d6, d7];

    const addresses = ds.map(d => d.address);

    const wSum = createCsvWriter({
        path: 'delegators_after_migration_summary_2.csv',
        header: ["Address", "Sum balance", "Rewards", "Unstaked, unredeemable", "Unstaked, redeemable"]
    });
    let data = [];

    // for (let j = 0; j < addresses.length; j++) {
    //     let delegatorAddress = addresses[j];
    //     for (var i = 0; i < validatorN; i++) {
    //         const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i);
    //         // for (var k = 0; k < delegatorData.unstakingAmounts.length; k++) {
    //         //     let amount = delegatorData.unstakingAmounts[k];
    //         //     if (amount.gt(0)) {
    //         //         await stakingContract.connect(ds[j]).transferUnstakedOut(
    //         //             amount,
    //         //             i,
    //         //             k
    //         //         );
    //         //     }
    //         // }

    //         // 48 744 000 000 000 000 000 000
    //         // 48 783 840 000 000 046 381 403

    //         if (delegatorData.staked.gte(ethers.BigNumber.from(100000000)))
    //             await stakingContract.connect(ds[j]).unstake(i, delegatorData.staked);
    //         // if (delegatorData.rewards.gte(10 ^ 8))
    //         //     await stakingContract.connect(ds[j]).redeemAllRewards(i, delegatorAddress);

    //     }

    // }

    let vs = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14];

    for (let index = 0; index < vs.length; index++) {
        const v = vs[index];
        const delegatorData = await stakingContract.getDelegatorMetadata(v.address, index);
        if (delegatorData.commissionEarned.gt(0))

            await stakingContract.connect(v).redeemAllCommission(index, v.address);

    }

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });