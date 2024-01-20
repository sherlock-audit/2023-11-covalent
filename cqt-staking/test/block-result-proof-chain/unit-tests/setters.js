




const {getAllWithProofchain, oneToken, getAccounts} = require('../../fixtures.js');
const {expect} = require('chai');


describe('Tests all setters', function() {
  beforeEach(async function() {
    [
      owner,
      stakingContract,
      cqtContract,
      proofChain,
      validators,
      operators,
      delegators,
      stakingManager,
    ] = await getAllWithProofchain({withProofChain: 'BlockResult'});
    blockResultRewardAllocation = oneToken.mul(3);
  });

  it('Lets Governance change the blockResultRewardAllocation', async function() {
    await proofChain
        .connect(owner)
        .setBlockResultReward(blockResultRewardAllocation);
  });

  it('Emits BlockResultRewardChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setBlockResultReward(blockResultRewardAllocation),
    )
        .to.emit(proofChain, 'BlockResultRewardChanged')
        .withArgs(blockResultRewardAllocation);
  });

  it('Does not let non-governance change the blockResultRewardAllocation', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setBlockResultReward(blockResultRewardAllocation),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for blockResultRewardAllocation', async function() {
    await proofChain
        .connect(owner)
        .setBlockResultReward(blockResultRewardAllocation);

await expect((await proofChain.connect(owner).getMetadata()).blockResultRewardAllocation).to.equal(blockResultRewardAllocation);
  });


  it('Lets Governance change the blockResultSessionDuration', async function() {
    await proofChain
        .connect(owner)
        .setBlockResultSessionDuration(50);
  });

  it('Emits ResultSessionDurationChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setBlockResultSessionDuration(50),
    )
        .to.emit(proofChain, 'ResultSessionDurationChanged')
        .withArgs(50);
  });

  it('Does not let non-governance change the blockResultSessionDuration', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setBlockResultSessionDuration(50),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for blockResultSessionDuration', async function() {
    await proofChain
        .connect(owner)
        .setBlockResultSessionDuration(50);

    await expect(
        (await proofChain.connect(owner).getMetadata()).blockResultSessionDuration,
    ).to.equal(50);
  });

  it('Lets Governance change the blockResultQuorum', async function() {
    await proofChain
        .connect(owner)
        .setQuorumThreshold(oneToken);
  });

  it('Emits ResultSessionQuorumChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setQuorumThreshold(oneToken),
    )
        .to.emit(proofChain, 'ResultSessionQuorumChanged')
        .withArgs(oneToken);
  });

  it('Does not let non-governance change the blockResultQuorum', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setQuorumThreshold(oneToken),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for blockResultQuorum', async function() {
    await proofChain
        .connect(owner)
        .setQuorumThreshold(oneToken);

    await expect(
        (await proofChain.connect(owner).getMetadata()).blockResultQuorum,
    ).to.equal(oneToken);
  });


  it('Lets a governance role set the staking manager to a new address', async function() {
    await proofChain
        .connect(owner)
        .setStakingManagerAddress(stakingContract.address);
  });

  it('Emits StakingInterfaceChanged and successfully executes when governance calls', async function() {
    await expect(proofChain
        .connect(owner)
        .setStakingManagerAddress(stakingContract.address))
          .to.emit(proofChain, 'StakingManagerChanged')
          .withArgs(stakingContract.address);
  });

  it('Changes staking manager', async function() {
    newStakingManagerAddress = (await getAccounts(1))[0];
    await proofChain
        .connect(owner)
        .setStakingManagerAddress(newStakingManagerAddress.address)
        await expect((await proofChain.connect(owner).getMetadata()).stakingManager).to.equal(newStakingManagerAddress.address);
  });

  it('Reverts when non-governance sets staking contract address to a new address', async function() {
    await expect(
        proofChain
            .connect(operators[0])
            .setStakingManagerAddress(stakingContract.address),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });



  it('Lets Governance change the minSubmissionsRequired', async function() {
    await proofChain
        .connect(owner)
        .setMinSubmissionsRequired(1);
  });

  it('Emits ResultSessionMinSubmissionChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setMinSubmissionsRequired(2),
    )
        .to.emit(proofChain, 'ResultSessionMinSubmissionChanged')
        .withArgs(2);
  });

  it('Does not let non-governance change the minSubmissionsRequired', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setMinSubmissionsRequired(10),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for minSubmissionsRequired', async function() {
    await proofChain
        .connect(owner)
        .setMinSubmissionsRequired(5);

    await expect(
        (await proofChain.connect(owner).getMetadata()).minSubmissionsRequired,
    ).to.equal(5);
  });

it('Lets Governance change the minSubmissionsRequired', async function() {
    await proofChain
        .connect(owner)
        .setNthBlock(1, 2);
  });

  it('Emits NthBlockChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setNthBlock(2, 10),
    )
        .to.emit(proofChain, 'NthBlockChanged')
        .withArgs(2, 10);
  });

  it('Does not let non-governance change the nthBlock', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setNthBlock(10, 700),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for nthBlock', async function() {
    await proofChain
        .connect(owner)
        .setNthBlock(6, 8);

    await expect(
        (await proofChain.connect(owner).getChainData(6)).nthBlock,
    ).to.equal(8);
  });


it('Lets Governance change the setSecondsPerBlock', async function() {
    await proofChain
        .connect(owner)
        .setSecondsPerBlock(1);
  });

  it('Emits SecondsPerBlockChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setSecondsPerBlock( 10),
    )
        .to.emit(proofChain, 'SecondsPerBlockChanged')
        .withArgs(10);
  });

  it('Does not let non-governance change the maxNumberOfHashesPer24H', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setSecondsPerBlock(700),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for maxNumberOfHashesPer24H', async function() {
    await proofChain
        .connect(owner)
        .setSecondsPerBlock(8);

    await expect(
      (await proofChain.connect(owner).getMetadata()).secondsPerBlock,
    ).to.equal(8);
  });


  it('Lets Governance change the maxSubmissionsPerBlockHeight', async function() {
    await proofChain
        .connect(owner)
        .setMaxSubmissionsPerBlockHeight(1,1);
  });

  it('Emits BlockResultMaxNumberOfHashesPer24HChanged', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setMaxSubmissionsPerBlockHeight(1,2),
    )
        .to.emit(proofChain, 'MaxSubmissionsPerBlockHeightChanged')
        .withArgs(2);
  });

  it('Does not let non-governance change the maxSubmissionsPerBlockHeight', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setMaxSubmissionsPerBlockHeight(1,10),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for maxSubmissionsPerBlockHeight', async function() {
    await proofChain
        .connect(owner)
        .setMaxSubmissionsPerBlockHeight(1,6);

    await expect(
        (await proofChain.connect(owner).getChainData(1)).maxSubmissionsPerBlockHeight,
    ).to.equal(6);
  });

  it('Lets Governance change the chainSyncData and emits event with correct args', async function() {
    await expect(proofChain
        .connect(owner)
        .setChainSyncData(1, 2, 3, 4))
    .to.emit(proofChain, 'ChainSyncDataChanged')
        .withArgs(1, 2, 3, 4);
  });

  it('Does not let non-governance change the chainSyncData', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setChainSyncData(1, 2, 3, 4))
    .to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Reverts when seconds per block is 0', async function() {
    await expect(
        proofChain
            .connect(owner)
            .setChainSyncData(1, 2, 3, 0))
    .to.be.revertedWith('Seconds per block cannot be 0');
  });

  it('Tests the getter for maxSubmissionsPerBlockHeight', async function() {
    await proofChain
    .connect(owner)
    .setChainSyncData(1, 2, 3, 4)

    const data = await proofChain.getChainData(1)

    await expect(data.blockOnTargetChain).to.equal(2);
    await expect(data.blockOnCurrentChain).to.equal(3);
    await expect(data.secondsPerBlock).to.equal(4);

  });

  it('Lets Governance change the allowedThreshold and emits event with correct args', async function() {
    await expect(proofChain
        .connect(owner)
        .setBlockHeightSubmissionsThreshold(1, 2))
    .to.emit(proofChain, 'BlockHeightSubmissionThresholdChanged')
        .withArgs(1, 2);
  });

  it('Does not let non-governance change the allowedThreshold', async function() {
    await expect(
        proofChain
            .connect(delegators[0])
            .setBlockHeightSubmissionsThreshold(1, 2))
    .to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Tests the getter for allowedThreshold', async function() {
    await proofChain
    .connect(owner)
    .setBlockHeightSubmissionsThreshold(1, 2)

    const data = await proofChain.getChainData(1)
    await expect(data.allowedThreshold).to.equal(2);
  });
});
