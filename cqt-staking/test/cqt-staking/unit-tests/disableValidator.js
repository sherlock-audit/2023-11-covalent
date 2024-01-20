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
  mineBlocks,
  addStakedValidator,
} = require('../../fixtures');

describe('Disable validator', function() {
  // it('Should not be able to call stake after validator got disabled.', async function() {
  //   const [
  //     opManager,
  //     contract,
  //     cqtContract,
  //     validator1,
  //     validator2,
  //     delegator1,
  //     delegator2,
  //   ] = await getAll();
  //   deposit(contract, oneToken.mul(100000));
  //   await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
  //   await stake(oneToken.mul(100000), validator1, cqtContract, contract, 0);
  //   mineBlocks(10);
  //   await contract.connect(opManager).disableValidator(0, 1000);
  //   await expect(
  //       stake(oneToken.mul(100000), delegator1, cqtContract, contract, 0),
  //   ).to.revertedWith('Validator is disabled');
  // });

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
    await expect(await contract.connect(opManager).disableValidator(0))
        .to.emit(contract, 'ValidatorDisabled')
        .withArgs(0, await ethers.provider.getBlockNumber());
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
    await contract.addValidator(VALIDATOR_1, oneToken.div(10));
    let details = await contract.getValidatorMetadata(0);
    await expect(details.disabledAtBlock).to.equal(1);
    await contract.connect(opManager).disableValidator(0);
    details = await contract.getValidatorMetadata(0);
    await expect(details.disabledAtBlock).to.equal(await ethers.provider.getBlockNumber());
  });

  it('Should revert when trying to disable invalid validator.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await expect(contract.connect(opManager).disableValidator(0))
    .to.revertedWith('Invalid validator');;
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await expect(contract.connect(opManager).disableValidator(0));
  });
});
