const { ethers } = require('hardhat');
const {
    oneToken,
    sleep
} = require('../test/fixtures.js');
const {
    confirmInputsWithStaking, confirmInputs
} = require('../scripts/contractPrompt.js');

const BRP_STAKE_REQUIRED = 35000;
const BLOCK_RESULT_REWARD = 5;
const RESULT_QUORUM = 50;
const MIN_SUBMISSIONS_REQUIRED = 2;
const ONE_PERCENT = ethers.BigNumber.from('10000000000000000');
const BRP_SESSION_DURATION = 3000

const DEFAULT_VALUES = [
    BRP_STAKE_REQUIRED,
    BLOCK_RESULT_REWARD,
    RESULT_QUORUM,
    MIN_SUBMISSIONS_REQUIRED,
    BRP_SESSION_DURATION
];
const VALUE_NAMES = [
    "bsp stake required, unscaled (if 1 is entered it will scale to 10^18)",
    "block specimen reward, unscaled (if 1 is entered it will scale to 10^18)",
    "specimen quorum requirement (1-100%)",
    "min submissions required in order for a session to be valid",
    "block specimen session duration (in blocks)"
];

async function main() {
    const [_, owner, scManager] = await ethers.getSigners();
    let result = await confirmInputs(
        "deploying ProofChain",
        VALUE_NAMES,
        DEFAULT_VALUES
    );

    if (result.confirmed) {
        const [brpStakeRequired, blockResultReward, resultQuorumThreshold,
            minSubmissionsRequired, brpSesssionDuration
        ] = result.values;

        ProofChainFactory = await ethers.getContractFactory('BlockResultProofChain', owner);
        const pc = await upgrades.deployProxy(
            ProofChainFactory, [owner.address, scManager.address], { initializer: 'initialize' },
        );
        proofChain = await pc.deployed();

        await proofChain
            .connect(owner)
            .setBlockResultReward(oneToken.mul(blockResultReward), { gasLimit: 1000000 });
        await proofChain
            .connect(owner)
            .setQuorumThreshold(ONE_PERCENT.mul(resultQuorumThreshold), { gasLimit: 1000000 });
        await proofChain
            .connect(owner)
            .setMinSubmissionsRequired(minSubmissionsRequired, { gasLimit: 1000000 });
        await proofChain
            .connect(owner)
            .setBlockResultSessionDuration(brpSesssionDuration, { gasLimit: 1000000 });

        console.log();
        console.log('Proof Chain address: ', proofChain.address);
        console.log('Contract owner address: ', owner.address);
        console.log('staking manager address is also set to', scManager.address);
        console.log(await proofChain.getMetadata());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });