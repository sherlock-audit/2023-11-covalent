// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const { ethers } = require('hardhat');
const {
    getDeployedContractsWithProofchain,
    deposit,
    stake,
    getCqtContract,
    BLOCK_SPECIMEN_PRODUCER_ROLE,
    OPERATOR_1,
    OWNER,
    oneToken,
    CQT_ETH_MAINNET,
    giveEth,
} = require('../test/fixtures.js');

// NOTE: These addresses need to be updated if new versions of contracts are deployed
// The ABI must be regenerated with `npx hardhat export-abi` if the contract code is changed
const stakingAbi = require('../generated-abis/ugly/OperationalStaking.json');
const StakingAddress = '0x9a42d29eA676A1bFaC02427A06e9f5b830E6D496';

const proofChainAbi = require('../generated-abis/ugly/BlockResultProofChain.json');
const ProofChainAddress = '0x06a38f70c8e245e1cfe1b7d5aca1b7cd29380343';

async function getStakingContract(signer) {
    return new ethers.Contract(StakingAddress, stakingAbi, signer);
}

async function getProofChainContract(signer) {
    return new ethers.Contract(ProofChainAddress, proofChainAbi, signer);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function main() {
    const [owner, v1, v2] = await ethers.getSigners();

    console.log(owner.address)
    console.log(v2.address)

    // await sleep(2000000)

    const proofChain = await getProofChainContract(owner);

    let operatorAddress = "0xCaD9082D5f5e818b1A528A128b6688B8Cb484037"

    await proofChain.connect(v2).enableBRPOperator(operatorAddress);

    console.log();
    console.log('Added new operator instance');
    console.log('Staking address: ', StakingAddress);
    console.log('Validator address: ', v2.address);
    console.log('Operator address: ', operatorAddress);

    await sleep(10000)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });