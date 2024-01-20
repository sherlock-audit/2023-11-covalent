const {
    setupDefaultOperators,
    oneToken,
    mineBlocks,
    getHash
} = require('../../fixtures.js');
const { expect } = require('chai');
const createKeccakHash = require('keccak');

describe('Tests submitBlockResultProof()', function () {
    chainId = 1;
    blockHeight = 123;
    resultSize = 15;
    resultLength = 1;
    storageURL = 'example.com';
    resultHash = getHash('main result');
    altHash = getHash('alternate result');

    beforeEach(async function () {
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
                ((await proofChain
                    .connect(owner).getMetadata())
                    .blockResultQuorum)) /
            10 ** 18,
        );
        sessionDuration = (await proofChain
            .connect(owner)
            .getMetadata())
            .blockResultSessionDuration;

    });

    it('Lets a BRP role submit a result proof and add matching urls', async function () {
        await expect(proofChain
            .connect(operators[0])
            .submitBlockResultProof(
                chainId,
                blockHeight,
                resultHash,
                resultHash,
                'e1',
            )
        )
            .to.emit(proofChain, 'BlockResultProductionProofSubmitted');

        await expect(proofChain
            .connect(operators[1])
            .submitBlockResultProof(
                chainId,
                blockHeight,
                resultHash,
                resultHash,
                'e2',
            )
        )
            .to.emit(proofChain, 'BlockResultProductionProofSubmitted');

        await expect(proofChain
            .connect(operators[1])
            .submitBlockResultProof(
                chainId,
                blockHeight + 1,
                resultHash,
                resultHash,
                'e3',
            )
        )
            .to.emit(proofChain, 'BlockResultProductionProofSubmitted');

        await expect(proofChain
            .connect(operators[1])
            .submitBlockResultProof(
                chainId,
                blockHeight + 1,
                altHash,
                resultHash,
                'e4',
            )
        )
            .to.emit(proofChain, 'BlockResultProductionProofSubmitted');


        let urls = await proofChain.getURLS(resultHash);
        expect(urls[0]).to.equal('e1');
        expect(urls[1]).to.equal('e2');
        expect(urls[2]).to.equal('e3');
        expect(urls[3]).to.equal('e4');
    });
});
