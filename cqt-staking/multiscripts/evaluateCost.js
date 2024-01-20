const { ethers } = require('hardhat');
const {
    getStakingContract,
    getBspProofChainContract,
} = require('../test/fixtures.js');


async function main() {
    const [cqtOwner, contractDeployer, scManager, v1, op1_1, op1_2, v2, op2_1, v_bak, v3] = await ethers.getSigners();

    let stakingContract = await getStakingContract(scManager, "0xC4FB33c11d39498429BdAB7AC7f5CF42F4dDaeEF");
    //let bspContract = await getBspProofChainContract(scManager, "0xE5939AD205F9124f9a0EA4a48CAAE8903454ccfd");
    //result = await stakingContract.connect(scManager).owner();
    //console.log('owner is:', result);
    

    //const gasEstimate = await stakingContract.estimateGas.rewardValidators(1234555, [0, 1, 2], [1, 1, 4]);
    //console.log("Estimated Gas: ", gasEstimate.toString());

    // result = await stakingContract.rewardValidators(1234555, [0, 1, 2], [1,1,1]);
    // console.log(await result.wait());

    const gasEstimate = await stakingContract.estimateGas.redeemAllRewards(0, v1.address);
    console.log("Estimated Gas: ", gasEstimate.toString());



    //result = await stakingContract.connect(contractDeployer).setStakingManagerAddress(scManager.address);
//    console.log(result);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
