const {expect} = require('chai');
const {ethers} = require('hardhat');

const {
  stake,
  deposit,
  getAll,
  mineBlocks,
  getOwner,
  getDeployedContract,
  getAllocatedTokensPerEpoch,
  getEndEpoch,
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
} = require('../../fixtures');

describe('Reward validator', function() {


  it('Should change reward pool', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken]);
    let md = await contract.getMetadata();
    await expect(md._rewardPool).to.equal(oneToken.mul(9));

    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(1000)]);
    md = await contract.getMetadata();
    await expect(md._rewardPool).to.equal(oneToken.mul(9));

    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(111)]);
    md = await contract.getMetadata();
    await expect(md._rewardPool).to.equal(oneToken.mul(898));
  });

  it('Should commission available to redeem', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken]);
    const md = await contract.getDelegatorMetadata(validator1.address, 0);
    await expect(md.commissionEarned).to.equal(oneToken.div(10));
  });

  // it('Should emit Rewarded event with correct validatorId, commission paid and amount emitted', async function() {
  //   const [
  //     opManager,
  //     contract,
  //     cqtContract,
  //     validator1,
  //     validator2,
  //     delegator1,
  //     delegator2,
  //   ] = await getAll();
  //   await deposit(cqtContract, contract, oneToken.mul(10));
  //   await contract.connect(opManager).setValidatorEnableMinStake(0);

  //   await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
  //   await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
  //   await contract.connect(opManager).enableValidator(0);

  //   await expect(await contract.connect(opManager).rewardValidators([0], [ oneToken]))
  //       .to.emit(contract, 'Rewarded')
  //       .withArgs(0, oneToken.sub(oneToken.div(10)), oneToken.div(10));
  // });


  it('Should emit Rewarded failed due to low pool event with correct validatorId and amount', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await expect(await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(1000)]))
        .to.emit(contract, 'RewardFailedDueLowPool')
        .withArgs(0, oneToken.mul(1000));
  });


  it('Should emit Rewarded failed due to zero stake event with correct validatorId and amount ', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await contract.connect(opManager).setValidatorEnableMinStake(0);

    await contract.connect(opManager).addValidator(validator1.address, oneToken.div(10));
    await contract.connect(opManager).enableValidator(0);

    await expect(await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(10)]))
        .to.emit(contract, 'RewardFailedDueZeroStake')
        .withArgs(0, oneToken.mul(10));
  });

  it('Should emit Rewarded failed due to validator disabled event with correct validatorId and amount ', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await contract.connect(opManager).addValidator(validator1.address, oneToken.div(10));

    await expect(await contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(10)]))
        .to.emit(contract, 'RewardFailedDueValidatorDisabled')
        .withArgs(0, oneToken.mul(10));
  });

  it('Should emit Rewarded failed due to validator frozen event with correct validatorId and amount ', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await contract.connect(opManager).addValidator(validator1.address, oneToken.div(10));
    await contract.connect(opManager).freezeValidator(0, "foo");
    await expect(await contract.connect(opManager).rewardValidators(1234, [0], [oneToken.mul(10)]))
        .to.emit(contract, 'RewardFailedDueValidatorFrozen')
        .withArgs(0, oneToken.mul(10));
  });

  it('Should revert when given uneven number of ids and reward amounts', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(10));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await expect(contract.connect(opManager).rewardValidators(1234, [0,1], [ oneToken.mul(10)]))
        .to.revertedWith("Given ids and amounts arrays must be of the same length");
    await expect(contract.connect(opManager).rewardValidators(1234, [0], [ oneToken.mul(10), 1]))
        .to.revertedWith("Given ids and amounts arrays must be of the same length");
  });
});
