
const { ethers } = require('hardhat');
const {
    confirmInputsWithStaking
} = require('./contractPrompt.js');

const DEFAULT_STAKING_ADDRESS = "";

const DELEGATOR_ADDRESS = "";
const DEFAULT_VALUES = [DELEGATOR_ADDRESS];
const VALUE_NAMES = ["Delegator address"];

async function main() {
    const [owner] = await ethers.getSigners();

    let result = await confirmInputsWithStaking(
        owner,
        "Getting delegator data",
        DEFAULT_STAKING_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [delegatorAddress] = result.values;
        const stakingContract = result.staking;

        const validatorN = (await stakingContract.getMetadata())._validatorsN;
        for (var i = 0; i < validatorN; i++) {
            const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i);
            console.log();
            console.log("Validator id: ", i);
            console.log('Staked: ', delegatorData.staked);
            console.log('Rewards available to redeem: ', delegatorData.rewards);
            console.log('Commission available to redeem (if delegator is validator itself)', delegatorData.commissionEarned);
            for (var j = 0; j < delegatorData.unstakingAmounts.length; j++) {
                console.log("Unstaking " + j + ": amount - " + delegatorData.unstakingAmounts[j] + ", cool down end block - " + delegatorData.unstakingsEndEpochs[j]);
            }
        }

        // let sum = oneToken
        // for (var i = 0; i < validatorN; i++) {
        //     const delegatorData = await stakingContract.getValidatorCompoundedStakingData(i)
        //     console.log();
        //     console.log("Validator id: ", i)
        //     console.log('Staked: ', (delegatorData.staked).add(delegatorData.delegated));
        //     sum = sum.add((delegatorData.staked).add(delegatorData.delegated))
        //     // console.log('Rewards available to redeem: ', delegatorData.rewards);
        //     // console.log('Commission available to redeem (if delegator is validator itself)', delegatorData.commissionEarned)
        //     // for (var j = 0; j < delegatorData.unstakingAmounts.length; j++) {
        //     //     console.log("Unstaking " + j + ": amount - " + delegatorData.unstakingAmounts[j] + ", cool down end block - " + delegatorData.unstakingsEndEpochs[j])
        //     // }
        // }

        // console.log((sum.sub(oneToken)).div(oneToken))
    }

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });