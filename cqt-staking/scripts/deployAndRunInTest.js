
const { ethers } = require('hardhat');
const {
    oneToken,
    setupDefaultOperators,
    getHash,
    mineBlocks
} = require('../test/fixtures.js');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function main() {

    [contractsAndAccounts, parameters] = await setupDefaultOperators();

    [
      owner,
      contract,
      cqtContract,
      proofChain,
      validators,
      operators,
      delegators,
    ] = contractsAndAccounts;

    console.log('Current block: ', await ethers.provider.getBlockNumber());
    console.log('Staking Contract address: ', stakingContract.address);
    console.log('Contract owner address: ', owner.address);
    console.log("ProofChain", proofChain.address)

    console.log();

    await proofChain.connect(owner).setBlockSpecimenSessionDuration(5)

    i = 0

    while (true){
        res = await proofChain.connect(operators[0])
        .submitBlockSpecimenProof(
            1,
            i,
            getHash("a"),
            getHash("specimenHash"),
            "storageURL"
        )
        await sleep(3000);
        await proofChain.connect(operators[1])
        .submitBlockSpecimenProof(
            1,
            i,
            getHash("a"),
            getHash("specimenHash"),
            "storageURL"
        )
        await sleep(3000);

        await proofChain.connect(operators[2])
        .submitBlockSpecimenProof(
            1,
            i,
            getHash("a"),
            getHash("specimenHash"),
            "storageURL"
        )
        await mineBlocks(3)
        await sleep(3000);

        await proofChain.connect(owner).finalizeAndRewardSpecimenSession(1, i)

        await sleep(10000);
        i ++
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
