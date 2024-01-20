const {
  setupDefaultOperators, BLOCK_RESULT_PRODUCER_ROLE, DELEGATOR_1, DELEGATOR_2
} = require('../../fixtures.js');
const {expect} = require('chai');

describe('Tests Governance control: removeBRPOperator()', function() {
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


    validator1ID = 0;
    validator2ID = 1;
    validator3ID = 2;

  });

  it('Lets Governance remove an operator', async function() {
    await proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address);
  });

  it('Emits OperatorRemoved', async function() {
    await expect(proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address))
        .to.emit(proofChain, 'OperatorRemoved')
        .withArgs(operators[0].address, 0, 0, BLOCK_RESULT_PRODUCER_ROLE);
  });


  it('Does not let a non-governance role call removeBRPOperator()', async function() {
    await expect(
        proofChain.connect(operators[0]).removeBRPOperator(operators[validator1ID].address),
    ).to.be.revertedWith('Sender is not GOVERNANCE_ROLE');
  });

  it('Emits ValidatorDisable on staking contract when count is 0', async function() {
    await expect(
        proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address),
    ).to.emit(proofChain, 'OperatorRemoved')
     .withArgs(operators[validator1ID].address, 0, 0, BLOCK_RESULT_PRODUCER_ROLE);
  });

  it('Removes brp role', async function() {
    await proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address);
    await expect(await proofChain
          .connect(validators[validator1ID])
          .operatorRoles(
            operators[validator1ID].address)
          ).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it('Removes from brps', async function() {
    let brps = (await proofChain.getAllOperators())._brps
    await expect(brps).to.contain(operators[validator1ID].address);
    await proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address);
    brps = (await proofChain.getAllOperators())._brps
    await expect(brps).to.not.contain(operators[validator1ID].address);
  });

  it('Removes operator from validator ids', async function() {
    await proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address);
    await expect(await proofChain
          .connect(validators[validator1ID])
          .validatorIDs(
            operators[validator1ID].address)
          ).to.equal(0);
  });

  it('Should revert when trying to remove an operator that does not exist or has a different role', async function() {
    await proofChain.connect(owner).addBRPOperator(delegators[0].address, 0);
    await proofChain.connect(owner).addGovernor(delegators[1].address);
    await expect(proofChain
        .connect(owner)
        .removeBRPOperator(validators[0].address)).to.be.revertedWith('Operator is not BRP');

        await expect(proofChain
            .connect(owner)
            .removeBRPOperator(delegators[1].address)).to.be.revertedWith('Operator is not BRP');
  });

  it('adding multiple operators (same validator) and then removing them emits OperatorRemoved events', async function() {
    // add 1 validator and enable
    validator = validators[validator1ID]
    await proofChain.connect(stakingManager).enableValidator(0);

    // add 2 more operators (use the delegators) with validatorId=0
    // enable brp operator (correct count expected)
    await expect(proofChain.connect(owner).addBRPOperator(DELEGATOR_1, validator1ID))
           .to.emit(proofChain, 'OperatorAdded');
    await expect(proofChain.connect(owner).addBRPOperator(DELEGATOR_2, validator1ID))
           .to.emit(proofChain, 'OperatorAdded');

    // remove brp operator (correct count expected)
    await expect(proofChain.connect(owner).removeBRPOperator(operators[validator1ID].address))
                .to.emit(proofChain, 'OperatorRemoved')
                .withArgs(operators[validator1ID].address, validator1ID, 2, BLOCK_RESULT_PRODUCER_ROLE);

    await expect(proofChain.connect(owner).removeBRPOperator(DELEGATOR_1))
                .to.emit(proofChain, 'OperatorRemoved')
                .withArgs(DELEGATOR_1, validator1ID, 1, BLOCK_RESULT_PRODUCER_ROLE);

    await expect(proofChain.connect(owner).removeBRPOperator(DELEGATOR_2))
                .to.emit(proofChain, 'OperatorRemoved')
                .withArgs(DELEGATOR_2, validator1ID, 0, BLOCK_RESULT_PRODUCER_ROLE);
  });
});
