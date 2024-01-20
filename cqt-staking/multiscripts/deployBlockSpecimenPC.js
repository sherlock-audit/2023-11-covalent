const { ethers } = require('hardhat');
const {
    oneToken
} = require('../test/fixtures.js');
const {
    confirmInputs
} = require('../scripts/contractPrompt.js');

const BSP_STAKE_REQUIRED = 35000;
const BLOCK_SPECIMEN_REWARD = 10;
const SPECIMEN_QUORUM = 50;
const MIN_SUBMISSIONS_REQUIRED = 1;
const ONE_PERCENT = ethers.BigNumber.from('10000000000000000');
const BSP_SESSION_DURATION = 100

const DEFAULT_VALUES = [
    BSP_STAKE_REQUIRED,
    BLOCK_SPECIMEN_REWARD,
    SPECIMEN_QUORUM,
    MIN_SUBMISSIONS_REQUIRED,
    BSP_SESSION_DURATION
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
        const [_, blockSpecimenReward, specimenQuorumThreshold,
            minSubmissionsRequired, bspSesssionDuration
        ] = result.values;

        ProofChainFactory = await ethers.getContractFactory('BlockSpecimenProofChain', owner);
        const pc = await upgrades.deployProxy(
            ProofChainFactory, [owner.address, scManager.address], { initializer: 'initialize' },
        );
        proofChain = await pc.deployed();

        await proofChain
            .connect(owner)
            .setBlockSpecimenReward(oneToken.mul(blockSpecimenReward));
        await proofChain
            .connect(owner)
            .setQuorumThreshold(ONE_PERCENT.mul(specimenQuorumThreshold));
        await proofChain
            .connect(owner)
            .setMinSubmissionsRequired(minSubmissionsRequired);
        await proofChain
            .connect(owner)
            .setBlockSpecimenSessionDuration(bspSesssionDuration);

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
