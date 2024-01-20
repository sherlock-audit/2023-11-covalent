const { ethers } = require('hardhat');
const {
    oneToken,
    sleep
} = require('../test/fixtures.js');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";
const BRP_STAKE_REQUIRED = 35000;
const BLOCK_RESULT_REWARD = 5;
const RESULT_QUORUM = 50;
const MIN_SUBMISSIONS_REQUIRED = 2;
const ONE_PERCENT = ethers.BigNumber.from('10000000000000000');
const BRP_SESSION_DURATION = 3000
const DEFAULT_PROOFCHAIN_ADDRESS = "0xf28B9091AAe6471c016dF2d769c22e0Da97353ec"
    // const BRP_PROOFCHAIN_ABI = require("../generated-abis/ugly/BlockResultProofChain.json");

const DEFAULT_VALUES = [
    STAKING_ADDRESS,
    BRP_STAKE_REQUIRED,
    BLOCK_RESULT_REWARD,
    RESULT_QUORUM,
    MIN_SUBMISSIONS_REQUIRED,
    BRP_SESSION_DURATION
];
const VALUE_NAMES = [
    "staking address",
    "bsp stake required, unscaled (if 1 is entered it will scale to 10^18)",
    "block specimen reward, unscaled (if 1 is entered it will scale to 10^18)",
    "specimen quorum requirement (1-100%)",
    "min submissions required in order for a session to be valid",
    "block specimen session duration (in blocks)"
];

async function main() {

    const [owner] = await ethers.getSigners();
    console.log(owner.address)
    let result = await confirmInputsWithProofChain(
        owner,
        "deploying ProofChain",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    // stakingInterface: '0x237d022014e42B6757876c5D08fA435C8bA283fD',
    // blockSpecimenRewardAllocation: BigNumber { value: "8000000000000000000" },
    // blockResultRewardAllocation: BigNumber { value: "2000000000000000000" },
    // blockSpecimenSessionDuration: BigNumber { value: "145" },
    // minSubmissionsRequired: BigNumber { value: "1" },
    // blockSpecimenQuorum: BigNumber { value: "500000000000000000" },
    // secondsPerBlock: BigNumber { value: "1266" }

    if (result.confirmed) {
        const [stakingAddress, brpStakeRequired, blockResultReward, resultQuorumThreshold,
            minSubmissionsRequired, brpSesssionDuration
        ] = result.values;

        ProofChainFactory = await ethers.getContractFactory('BlockResultProofChain', owner);

        // const proofChain = await new ethers.Contract(
        //     DEFAULT_PROOFCHAIN_ADDRESS,
        //     BRP_PROOFCHAIN_ABI,
        //     owner
        // );

        const pc = await upgrades.deployProxy(
            ProofChainFactory, [owner.address, stakingAddress], { initializer: 'initialize' },
        );
        proofChain = await pc.deployed();

        await sleep(40000)

        await proofChain
            .connect(owner)
            .setBRPRequiredStake(oneToken.mul(brpStakeRequired), { gasLimit: 1000000 });
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
        console.log(await upgrades.erc1967.getImplementationAddress(DEFAULT_PROOFCHAIN_ADDRESS));
        console.log('Proof Chain address: ', proofChain.address);
        console.log('Contract owner address: ', owner.address);
        console.log(await proofChain.getMetadata());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });