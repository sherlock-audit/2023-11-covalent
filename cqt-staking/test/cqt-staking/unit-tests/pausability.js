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

describe('Pausability', function() {
  it('Pausing emits Paused event', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await expect(await contract.paused()).to.equal(false);

    await expect(
      contract.connect(opManager).pause()
    ).to.emit(contract, 'Paused');

    await expect(await contract.paused()).to.equal(true);
  });

  it('Unpausing emits Unpaused event', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).pause();

    await expect(
      contract.connect(opManager).unpause()
    ).to.emit(contract, 'Unpaused');
  });

  it('Unpausing reverts when not paused', async function() {
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
      contract.connect(opManager).unpause()
    ).to.revertedWith('must be paused');
  });

  it('Validator should not be able to stake when contract is paused', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);

    await contract.connect(opManager).pause();

    await expect(
      stakeForExpect(oneToken.mul(1000), validator1, cqtContract, contract, 0)
    ).to.revertedWith('paused');
  });

  it('Staking manager should still be able to perform admin functions when paused', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await contract.connect(opManager).pause();
    await deposit(cqtContract, contract, oneToken.mul(2000));
  });
});
