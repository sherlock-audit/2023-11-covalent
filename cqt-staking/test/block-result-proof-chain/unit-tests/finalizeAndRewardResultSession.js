const {
    setupDefaultOperators,
    oneToken,
    mineBlocks,
    getHash
  } = require('../../fixtures.js');
  const {expect} = require('chai');

  describe('Block Result Session finalization Tests', function() {
    beforeEach(async function() {
      [contractsAndAccounts, parameters] = await setupDefaultOperators({withProofChain: 'BlockResult'});

      [
        owner,
        stakingContract,
        cqtContract,
        proofChain,
        validators,
        operators,
        delegators,
        stakingManager,
      ] = contractsAndAccounts;
      [
        rewardPool,
        maxCapMultiplier,
        maxStakeLimit,
        brpStakeRequired,
        blockResultReward,
        resultQuorumThreshold,
      ] = parameters;

      numOperators = operators.length;
      quorumThreshold = Math.floor(
          (numOperators *
          ((await proofChain
              .connect(owner).getMetadata())
              .blockResultQuorum)) /
          10 ** 18,
      );

      chainId = 1;
      blockHeight = 123;
      resultSize = 15;
      resultLength = 1;
      storageURL = 'example.com';
      resultHash = getHash("main result")
      altHash = getHash("alternate result")
      sessionDuration = (await proofChain.connect(owner).getMetadata()).blockResultSessionDuration;
    });

    it('Reverts if the block result session has not started', async function() {
      await expect(
          proofChain
              .connect(owner)
              .finalizeResultSession(
                chainId,
                9999999999
              )
      ).to.be.revertedWith('Session not started');
    });

    it('Reverts if the deadline has not been reached', async function() {
      await expect(
          proofChain
              .connect(operators[0])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  resultHash,
                  resultHash,
                  storageURL,
              ),
      )
          .to.emit(proofChain, 'BlockResultProductionProofSubmitted');

      await expect(
          proofChain
              .connect(owner)
              .finalizeResultSession(
                chainId,
                blockHeight
              )
      ).to.be.revertedWith('Session not past deadline');
    });

    it('Changes require audit to true when not enough participants submitted, emits event and reverts if called again', async function() {
      await proofChain.connect(owner).setBlockResultSessionDuration(10);

      await proofChain
            .connect(operators[0])
            .submitBlockResultProof(
                chainId,
                blockHeight,
                resultHash,
                resultHash,
                storageURL,
            )

      await proofChain
            .connect(operators[1])
            .submitBlockResultProof(
                chainId,
                blockHeight,
                altHash,
                altHash,
                storageURL,
            )

      await mineBlocks(10)

      await expect(proofChain
            .connect(owner)
            .finalizeResultSession(
              chainId,
              blockHeight
            )
            ).to.emit(proofChain, 'QuorumNotReached')
            .withArgs(chainId, blockHeight);

      await expect(
          proofChain
              .connect(owner)
              .finalizeResultSession(
                chainId,
                blockHeight
              )
      ).to.be.revertedWith('Session cannot be finalized');

    });

    it('Changes require audit to true when quorum was not reached, emits event and reverts if called again', async function() {
      await proofChain.connect(owner).setBlockResultSessionDuration(10);

      for (i = 0; i < 3; i++) {
        await proofChain.connect(operators[i])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  resultHash,
                  resultHash,
                  storageURL,
              )
      }
      for (i = 0; i < 3; i++) {
        await proofChain.connect(operators[i+3])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  getHash("2"),
                  storageURL,
              )
      }
      for (i = 0; i < 3; i++) {
        await proofChain.connect(operators[i+6])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  altHash,
                  altHash,
                  storageURL,
              )
      }
      await proofChain.connect(operators[9])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("1"),
                  getHash("1"),
                  storageURL,
              )

      await mineBlocks(10)

      await expect(proofChain.connect(owner).finalizeResultSession( chainId, blockHeight))
      .to.emit(proofChain, 'QuorumNotReached').withArgs(chainId, blockHeight);

      await expect(proofChain.connect(owner).finalizeResultSession( chainId, blockHeight))
      .to.be.revertedWith('Session cannot be finalized');


      for (i = 0; i < 5; i++) {
        await proofChain.connect(operators[i])
              .submitBlockResultProof(
                  chainId,
                  1,
                  resultHash,
                  resultHash,
                  storageURL,
              )
      }
      for (i = 0; i < 5; i++) {
        await proofChain.connect(operators[i+5])
              .submitBlockResultProof(
                  chainId,
                  1,
                  getHash("2"),
                  getHash("2"),
                  storageURL,
              )
      }

      await mineBlocks(10)

      await expect(proofChain.connect(owner).finalizeResultSession( chainId, 1))
      .to.emit(proofChain, 'QuorumNotReached').withArgs(chainId, 1);

      await expect(proofChain.connect(owner).finalizeResultSession( chainId, 1))
      .to.be.revertedWith('Session cannot be finalized');
    });

    it('Emits result hash reward awarded event with the correct args when quorum is achieved', async function() {
      await proofChain.connect(owner).setQuorumThreshold(oneToken.div(2)); // 50%
      await proofChain.connect(owner).setBlockResultSessionDuration(11);

      for (i = 0; i < 6; i++) {
        await proofChain
              .connect(operators[i])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  resultHash,
                  storageURL,
              )
      }
      for (i = 0; i < 4; i++) {
        await proofChain
              .connect(operators[i+6])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  getHash("2"),
                  storageURL,
              )
      }

      await mineBlocks(10)

      // bitmap is (5 '1's followed by 251 '0's)
      // 0b1111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      await expect(proofChain
        .connect(owner)
        .finalizeResultSession(
          chainId,
          blockHeight
        )
        ).to.emit(proofChain, 'BlockResultQuorum')
        .withArgs(chainId, blockHeight, 113982837842983129870077688367927159293062641155239930226341059257789486989312n, getHash("2"), resultHash);

      await expect(
          proofChain
              .connect(owner)
              .finalizeResultSession(
                chainId,
                blockHeight
              )
      ).to.be.revertedWith('Session cannot be finalized');
    });


    it('Emits result hash reward awarded event with the correct args when quorum is achieved', async function() {
    await proofChain.connect(owner).setQuorumThreshold(oneToken.div(2)); // 50%
      await proofChain.connect(owner).setBlockResultSessionDuration(11);

      const stake = oneToken.mul(150)
      const totalStake = stake.mul(10)
      const reward = oneToken.mul(stake).div(totalStake)
      const commissionFee = reward.div(10)
      const rewardAfterComission = reward.sub(commissionFee)

      for (i = 0; i < 6; i++) {
        await proofChain
              .connect(operators[i])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  resultHash,
                  storageURL,
              )
      }
      for (i = 0; i < 4; i++) {
        await proofChain
              .connect(operators[i+6])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  getHash("2"),
                  storageURL,
              )
      }

      await mineBlocks(10)

      let res = proofChain
      .connect(owner)
      .finalizeResultSession(
        chainId,
        blockHeight
      )

      await expect(res
        ).to.emit(proofChain, 'BlockResultQuorum')
        .withArgs(chainId, blockHeight, 113982837842983129870077688367927159293062641155239930226341059257789486989312n, getHash("2"), resultHash);

  });


  it('Emits result hash reward awarded event with the correct args when quorum is achieved', async function() {
    await proofChain.connect(owner).setQuorumThreshold(oneToken.div(2)); // 50%
      await proofChain.connect(owner).setBlockResultSessionDuration(11);

      const stake = oneToken.mul(150)
      const totalStake = stake.mul(10)
      const reward = oneToken.mul(stake).div(totalStake)
      const commissionFee = reward.div(10)

      for (i = 0; i < 6; i++) {
        await proofChain
              .connect(operators[i])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("2"),
                  resultHash,
                  storageURL,
              )
      }
      for (i = 0; i < 2; i++) {
        await proofChain
              .connect(operators[i+6])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("3"),
                  getHash("2"),
                  storageURL,
              )
      }

      for (i = 0; i < 2; i++) {
        await proofChain
              .connect(operators[i+8])
              .submitBlockResultProof(
                  chainId,
                  blockHeight,
                  getHash("3"),
                  getHash("2"),
                  storageURL,
              )
      }

      await mineBlocks(10)

      let res = proofChain
      .connect(owner)
      .finalizeResultSession(
        chainId,
        blockHeight
      )

      await expect(res
        ).to.emit(proofChain, 'BlockResultQuorum')
        .withArgs(chainId, blockHeight, 113982837842983129870077688367927159293062641155239930226341059257789486989312n, getHash("2"), resultHash);

  });
});
