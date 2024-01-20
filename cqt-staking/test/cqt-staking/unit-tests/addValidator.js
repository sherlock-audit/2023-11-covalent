const {expect} = require('chai');
const {
  getAll,
  getValidatorsN,
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
  addStakedValidator,
} = require('../../fixtures');

describe('Add Validator', function() {
  it('Should change validators number.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    // deposit(contract, oneToken.mul(100000))
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    let validatorsN = await getValidatorsN(contract);
    await expect(validatorsN).to.equal(1);
    await addStakedValidator(0, contract, cqtContract, opManager, validator2, 20);
    await addStakedValidator(0, contract, cqtContract, opManager, delegator2, 20);
    validatorsN = await getValidatorsN(contract);
    await expect(validatorsN).to.equal(3);
  });

  it('Should emit event  with correct validator and commission rate.', async function() {
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
      contract.connect(opManager).addValidator(validator1.address, 10)
    ).to.emit(contract, 'ValidatorAdded').withArgs(0, '10', validator1.address);
  });

  it('Should add validator with correct commission rate.', async function() {
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
    let details = await contract.getValidatorMetadata(0);
    await expect(details.commissionRate).to.equal(10);
    await addStakedValidator(0, contract, cqtContract, opManager, validator2, 120000);
    await addStakedValidator(0, contract, cqtContract, opManager, delegator2, 5000000);
    details = await contract.getValidatorMetadata(1);
    await expect(details.commissionRate).to.equal(120000);
    details = await contract.getValidatorMetadata(2);
    await expect(details.commissionRate).to.equal(5000000);
  });

  it('Should add validator with correct address.', async function() {
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
    let details = await contract.getValidatorMetadata(0);
    await expect(details._address).to.equal(VALIDATOR_1);
    await addStakedValidator(0, contract, cqtContract, opManager, validator2, 120000);
    await addStakedValidator(0, contract, cqtContract, opManager, delegator2, 5000000);
    details = await contract.getValidatorMetadata(1);
    await expect(details._address).to.equal(validator2.address);
    details = await contract.getValidatorMetadata(2);
    await expect(details._address).to.equal(delegator2.address);
  });

  it('Should revert when validator address is 0.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await expect(contract.connect(opManager).addValidator("0x0000000000000000000000000000000000000000", 1)).to.be.revertedWith(
        'Validator address is 0',
    );

  });

  it('Should revert when commission rate is 100%', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await expect(contract.connect(opManager).addValidator(validator1.address, oneToken)).to.be.revertedWith(
        'Rate must be less than 100%',
    );

    await expect(contract.connect(opManager).addValidator(validator1.address, oneToken.add(1))).to.be.revertedWith(
      'Rate must be less than 100%',
  );

  });
});
