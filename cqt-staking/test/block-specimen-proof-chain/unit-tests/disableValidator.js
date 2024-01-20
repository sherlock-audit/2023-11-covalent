const {getAllWithProofchain} = require('../../fixtures.js');
const {expect} = require('chai');

describe('Tests disableValidator()', function() {

  beforeEach(async function() {
    [
      owner,
      stakingContract,
      cqtContract,
      proofChain,
      validators,
      operators,
      delegators,
    ] = await getAllWithProofchain({withProofChain: 'BlockSpecimen'});

    commissionRate = 10;
    blockNumber = 123;
  });

  it('Lets a governance role disable a validator after they are added', async function() {
    await proofChain.connect(stakingManager).enableValidator(0);
    await proofChain.connect(stakingManager).enableValidator(1);
    await proofChain.connect(stakingManager).enableValidator(2);

    await proofChain.connect(stakingManager).disableValidator(0);
    
    await proofChain.connect(stakingManager).disableValidator(1);
    await proofChain.connect(stakingManager).disableValidator(2);
  });

  it('Emits ValidatorDisabled when a validator is disabled', async function() {
    await proofChain.connect(stakingManager).enableValidator(0);

    await expect(proofChain.connect(stakingManager).disableValidator(0))
        .to.emit(proofChain, 'ValidatorDisabled')
        .withArgs(0);
  });

  it('Reverts when non-stakingmanager tries to disable a validator', async function() {
    await proofChain.connect(stakingManager).enableValidator(0);

    await expect(
        proofChain
            .connect(delegators[0])
            .disableValidator(0),
    ).to.be.revertedWith('Sender is not staking manager');
  });
});
