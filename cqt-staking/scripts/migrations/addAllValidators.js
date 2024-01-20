const { ethers } = require('hardhat');
const {
    confirmInputsWithStakingAndCQT
} = require('../contractPrompt.js');
const {
    oneToken,
    getCQTAddressOnCurrentNetwork,
    sleep
} = require('../../test/fixtures.js');
const cqtFaucetAbi = require('../../generated-abis/ugly/CovalentQueryTokenFaucet.json');
const migAbi = require('../../generated-abis/ugly/MigrationOperationalStaking.json');

const onePercent = ethers.BigNumber.from('10000000000000000');

const DEFAULT_CQT_ADDRESS = "";
const DEFAULT_STAKING_ADDRESS = "";
const DEFAULT_VALIDATOR_ADDRESS = 0;
const DEFAULT_COMMISSION_RATE = 0; // use onePercent

const RECOVERY_WALLET = "0xC08B340A3D77Ca51A2139676Cc9721bBC2C386a9";

const DEFAULT_VALUES = [DEFAULT_VALIDATOR_ADDRESS, DEFAULT_COMMISSION_RATE];
const VALUE_NAMES = ["validator address", "commission rate (1-100)%"];

async function main() {
    // const [owner] = await ethers.getSigners();
    const [owner, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, d1, d2, d3, d4, d5, d6, d7] = await ethers.getSigners();
    //    console.log(owner.address)
    let result = await confirmInputsWithStakingAndCQT(
        owner,
        "Adding new Validator",
        DEFAULT_STAKING_ADDRESS,
        DEFAULT_CQT_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {

        const cqt = await new ethers.Contract(result.cqt.address, cqtFaucetAbi, owner);

        // 1
        // await result.staking.connect(owner).setStakingManagerAddress(owner.address)

        // 2
        // console.log("Adding new validator...");
        // const validators = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
        // for (let index = 0; index < validators.length; index++) {
        //     const v = validators[index];
        //     await result.staking.connect(owner).addValidator(v.address, onePercent.mul(ethers.BigNumber.from(index)));
        // }

        // console.log();
        // console.log('Added new validator instance');

        // 3
        // let ids = [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14];
        // for (let index = 0; index < ids.length; index++) {
        //     const id = ids[index];
        //     await result.staking.connect(owner).enableValidator(id);
        // }


        // 4
        // const validators = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
        // let staking = result.staking
        // let cqt = result.cqt
        // for (let index = 0; index < validators.length; index++) {
        //     const v = validators[index];
        //     await cqt.connect(v).approve(staking.address, oneToken.mul(350000));
        // }

        // await sleep(60000);

        // for (let index = 0; index < validators.length; index++) {
        //     const v = validators[index];
        //     await staking.connect(v).stake(index, oneToken.mul(350000));
        // }



        //  5
        // let vals = [0, 1, 2, 3, 4, 5, 7, 9, 11, 12, 13, 14];
        // let ds = [d1, d2, d3, d4, d5, d6, d7, v10];
        // for (let index = 0; index < ds.length; index++) {
        //     const d = ds[index];
        //     await cqt.connect(owner).faucet(d.address, oneToken.mul(5000000));

        // }

        // 6
        // let vals = [0, 1, 2, 3, 4, 5, 7,  11, 12, 13, 14];
        // let ds = [d1, d2, d3, d4, d5, d6, d7, v10];
        // console.log(v10.address)

        // let staking = result.staking;

        // let pcs = [10, 5, 6, 4, 10, 15, 3, 47];

        // let metadata = await staking.getMetadata();
        // let multiplier = metadata._maxCapMultiplier;

        // for (let index = 0; index < vals.length; index++) {
        //     const id = vals[index];
        //     let vData = await staking.getValidatorMetadata(id);
        //     let delegationAvailable = (vData.staked.mul(multiplier)).sub(vData.delegated);
        //     console.log(delegationAvailable);

        //     if (delegationAvailable != 0) {
        //         for (let i = 0; i < ds.length; i++) {
        //             const d = ds[i];
        //             const pc = pcs[i];
        //             const toDelegate = delegationAvailable.mul(pc).div(100);
        //             await result.cqt.connect(d).approve(staking.address, toDelegate);
        //         }
        //         await sleep(30000);

        //         for (let i = 0; i < ds.length; i++) {
        //             const d = ds[i];
        //             const pc = pcs[i];
        //             const toDelegate = delegationAvailable.mul(pc).div(100);
        //             await result.staking.connect(d).stake(id, toDelegate);
        //         }

        //         await sleep(25000);
        //     }
        // }


        // // 7
        // await cqt.connect(owner).faucet(owner.address, oneToken.mul(50000));

        // // 8
        // await cqt.connect(owner).approve(result.staking.address, oneToken.mul(50000))
        // await sleep(25000);
        // await result.staking.depositRewardTokens(oneToken.mul(50000));

        // // 9
        // let vs = [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14];
        // let rewards = [10, 20, 14, 5, 11, 22, 17, 6, 20, 8, 15, 10, 12];
        // rewards = rewards.map(r => oneToken.mul(r));
        // let staking = result.staking

        // await staking.connect(owner).rewardValidators(vs, rewards);
        // await staking.connect(owner).rewardValidators(vs, rewards);
        // rewards = rewards.map(r => r.sub(oneToken.mul(2)));
        // await staking.connect(owner).rewardValidators(vs, rewards);
        // await staking.connect(owner).rewardValidators(vs, rewards);

        // console.log(await result.staking.getMetadata());

        // 10 - extract snapshots

        // // 11
        // const OperationalStakingV2 = await ethers.getContractFactory("MigrationOperationalStaking");
        // console.log("Preparing proposal...");
        // const proposal = await defender.proposeUpgrade(result.staking.address, OperationalStakingV2);
        // console.log("Upgrade proposal created at:", proposal.url);


        // // 12

        // const newStakingContract = await new ethers.Contract(result.staking.address, migAbi, owner);
        // await newStakingContract.connect(owner).burnDefaultDelegators()
        // let vs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        // for (let index = 0; index < vs.length; index++) {
        //     const v = vs[index];
        //     await newStakingContract.connect(owner).burnDelegatorBalance(v, "0xECE0c314f6c37BCd09b63b2c707F1bf29c47485e")
        // }
        // await newStakingContract.connect(owner).withdrawAllMadCQT(d1.address)

        // 13 - deploy new cqt Faucet

        // 14

        // const newStakingContract = await new ethers.Contract(result.staking.address, migAbi, owner);
        // await newStakingContract.connect(owner).setCQTAddress("0xa286C65C23227FFCAcE501FC722B96C65c9bB7a7")

        // 15
        // await cqt.connect(owner).faucet(result.staking.address, "8877822024906966461500326");

        // 16
        //  const OperationalStakingV2 = await ethers.getContractFactory("OperationalStaking");
        // console.log("Preparing proposal...");
        // const proposal = await defender.proposeUpgrade(result.staking.address, OperationalStakingV2);
        // console.log("Upgrade proposal created at:", proposal.url);

        // 17
        // let vs = [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14];
        // let rewards = [10, 20, 14, 5, 11, 22, 17, 6, 20, 8, 15, 10, 12];
        // rewards = rewards.map(r => oneToken.mul(r));
        // let staking = result.staking

        // await staking.connect(owner).rewardValidators(vs, rewards);
        // await staking.connect(owner).rewardValidators(vs, rewards);
        // rewards = rewards.map(r => r.sub(oneToken.mul(2)));
        // await staking.connect(owner).rewardValidators(vs, rewards);
        // await staking.connect(owner).rewardValidators(vs, rewards);

        // 18
        let ids = [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14];
        for (let index = 0; index < ids.length; index++) {
            const id = ids[index];
            await result.staking.connect(owner).disableValidator(id, 1);
        }

        // 18 - bulk unstake






    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });





