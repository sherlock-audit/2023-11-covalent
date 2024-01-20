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

describe("Tests submitBlockSpecimenProof()", function() {
    chainId = 1;
    blockHeight = 123;
    specimenSize = 15;
    specimenLength = 1;
    storageURL = "example.com";
    specimenHash = getHash("main specimen");
    altHash = getHash("alternate specimen");

    beforeEach(async function() {
        [contractsAndAccounts, parameters] = await setupDefaultOperators({withProofChain: 'BlockSpecimen'});
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
                (await proofChain.connect(owner).getMetadata()).blockSpecimenQuorum) /
            10 ** 18
        );
        sessionDuration = (await proofChain.connect(owner).getMetadata())
            .blockSpecimenSessionDuration;
    });

    it("50 operators participate", async function() {
        this.timeout(50000);
        let n = 50;
        let bsps = await getAccounts(n);
        let m = 0;

        while (m < n) {
            for (let index = 0; index < validators.length; index++) {
                const v = validators[index];
                await proofChain.connect(owner).addBSPOperator(bsps[m].address, index);
                await proofChain
                    .connect(validators[index])
                    .enableBSPOperator(bsps[m].address);
                m = m + 1;
            }
        }

        for (let index = 0; index < n; index++) {
            let specimenHash1 = getHash("main specimen" + index);
            const o = bsps[index];
            for (let j = 0; j < 3; j++) {
                let blockhash = getHash("b hash" + i + "a" + j);
                await proofChain
                    .connect(o)
                    .submitBlockSpecimenProof(
                        chainId,
                        blockHeight,
                        blockhash,
                        specimenHash1,
                        storageURL
                    );
            }
        }
        await mineBlocks(1000);
        await proofChain
            .connect(owner)
            .finalizeSpecimenSession(chainId, blockHeight);

    });
});
