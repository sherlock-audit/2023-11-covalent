const {expect} = require('chai');

const {
  getAll,
  getDeployedContract,
  oneToken,
  OWNER,
  VALIDATOR_1,
  VALIDATOR_2,
  OPERATOR_1,
  OPERATOR_2,
  DELEGATOR_1,
  DELEGATOR_2,
  CQT,
  deposit,
  stake,
  stakeForExpect,
  mineBlocks,
  addStakedValidator,
} = require('../../fixtures');

describe('Enable validator', function() {
  it('Should be able to call stake after validator got enabled after being disabled.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(100000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(10000), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).disableValidator(0);
    await contract.connect(opManager).enableValidator(0);
    await expect(stakeForExpect(oneToken, validator1, cqtContract, contract, 0))
        .to.emit(contract, 'Staked')
        .withArgs(0, VALIDATOR_1, oneToken);
    await expect(stakeForExpect(oneToken, delegator1, cqtContract, contract, 0))
        .to.emit(contract, 'Staked')
        .withArgs(0, delegator1.address, oneToken);
  });

  it('Should emit event with correct validator and disabled block.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await contract.connect(opManager).disableValidator(0);
    await expect(await contract.connect(opManager).enableValidator(0))
        .to.emit(contract, 'ValidatorEnabled')
        .withArgs(0);
  });

  it('Should return correct disabled block.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    let details = await contract.getValidatorMetadata(0);
    await expect(details.disabledAtBlock).to.equal(0);
    await contract.connect(opManager).disableValidator(0);
    await contract.connect(opManager).enableValidator(0);
    details = await contract.getValidatorMetadata(0);
    await expect(details.disabledAtBlock).to.equal(0);
  });

  it('Should revert when enabling invalid validator id.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await expect(contract.connect(opManager).enableValidator(0))
    .to.revertedWith('Invalid validator');
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(100000), validator1, cqtContract, contract, 0);
    mineBlocks(10);
    await expect(contract.connect(opManager).enableValidator(1))
    .to.revertedWith('Invalid validator');
  });

  it('Should revert when enabling under-staked validator', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    deposit(contract, oneToken.mul(100000));
    await contract.connect(opManager).setValidatorEnableMinStake(oneToken.mul(1000));

    await contract.connect(opManager).addValidator(validator1.address, 10);

    await expect(
      contract.connect(opManager).enableValidator(0)
    ).to.revertedWith('Validator is insufficiently staked');
  });


});
