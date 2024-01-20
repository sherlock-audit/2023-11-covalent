const {expect} = require('chai');
const {ethers} = require('hardhat');
const {
  stake,
  deposit,
  getAll,
  mineBlocks,
  getOwner,
  oneToken,
  OWNER,
  VALIDATOR_1,
  VALIDATOR_2,
  OPERATOR_1,
  OPERATOR_2,
  DELEGATOR_1,
  DELEGATOR_2,
  CQT,
  addStakedValidator,
  stakeForExpect
} = require('../../fixtures');

describe('Account freezing', function() {
  it('Freezing an invalid validator should revert', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await expect(
      contract.connect(opManager).freezeValidator(0, "foo")
    ).to.revertedWith('Invalid validator');
  });

  it('Freezing a validator should emit ValidatorFrozen event', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);

    await expect(
      contract.connect(opManager).freezeValidator(0, "suspicious activity")
    ).to.emit(contract, 'ValidatorFrozen');
  });

  it('Freezing a validator twice should revert', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);

    await expect(
      contract.connect(opManager).freezeValidator(0, "suspicious activity")
    ).to.emit(contract, 'ValidatorFrozen');

    await expect(
      contract.connect(opManager).freezeValidator(0, "more suspicious activity")
    ).to.revertedWith('Validator is already frozen');
  });

  it('Unfreezing a validator should emit ValidatorUnfrozen event', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);

    await contract.connect(opManager).freezeValidator(0, "foo");

    await expect(
      contract.connect(opManager).unfreezeValidator(0)
    ).to.emit(contract, 'ValidatorUnfrozen');
  });

  it('Unfreezing a not-frozen validator should revert', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);

    await expect(
      contract.connect(opManager).unfreezeValidator(0)
    ).to.revertedWith('Validator not frozen');
  });
});
