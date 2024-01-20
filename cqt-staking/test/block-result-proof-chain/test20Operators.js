const {
    setupDefaultOperators,
    oneToken,
    mineBlocks,
    getHash,
    getAccounts,
} = require("../fixtures.js");
const { expect } = require("chai");
const createKeccakHash = require("keccak");

var ethers = require("ethers");
var crypto = require("crypto");

describe("Tests submitBlockResultProof()", function() {
    chainId = 1;
    blockHeight = 123;
    resultSize = 15;
    resultLength = 1;
    storageURL = "example.com";
    resultHash = getHash("main result");
    altHash = getHash("alternate result");

    beforeEach(async function() {
        [contractsAndAccounts, parameters] = await setupDefaultOperators({withProofChain: 'BlockResult'});
        [
            owner,
            contract,
            cqtContract,
            proofChain,
            validators,
            operators,
            delegators,
        ] = contractsAndAccounts;

        await proofChain.connect(owner).setQuorumThreshold(BigInt(10 ** 18)); // 100%

        numOperators = operators.length;
        quorumThreshold = Math.floor(
            (numOperators *
                (await proofChain.connect(owner).getMetadata()).blockResultQuorum) /
            10 ** 18
        );
        sessionDuration = (await proofChain.connect(owner).getMetadata())
            .blockResultSessionDuration;
    });

    it("50 operators participate", async function() {
        this.timeout(50000);
        let n = 50;
        let brps = await getAccounts(n);
        let m = 0;

        while (m < n) {
            for (let index = 0; index < validators.length; index++) {
                const v = validators[index];
                await proofChain.connect(owner).addBRPOperator(brps[m].address, index);
                await proofChain
                    .connect(validators[index])
                    .enableBRPOperator(brps[m].address);
                m = m + 1;
            }
        }

        for (let index = 0; index < n; index++) {
            let resultHash1 = getHash("main result" + index);
            const o = brps[index];
            for (let j = 0; j < 3; j++) {
                let blockhash = getHash("b hash" + i + "a" + j);
                await proofChain
                    .connect(o)
                    .submitBlockResultProof(
                        chainId,
                        blockHeight,
                        blockhash,
                        resultHash1,
                        storageURL
                    );
            }
        }
        await mineBlocks(1000);
        await proofChain
            .connect(owner)
            .finalizeResultSession(chainId, blockHeight);

    });
});
