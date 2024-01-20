const {expect} = require('chai');
const {
  getAll,
  oneToken,
  OWNER,
  VALIDATOR_1,
  VALIDATOR_2,
  OPERATOR_1,
  deployStaking,
  OPERATOR_2,
  DELEGATOR_1,
  DELEGATOR_2,
  CQT,
  deposit,
  stake,
  CQT_ETH_MAINNET,
  addStakedValidator,
} = require('../../fixtures');

describe('Get delegator total value locked', function() {
  it('Should return correct # of tokens locked with validator', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator2,
    ] = await getAll();
    let minRequiredStakeAmount = await contract.connect(opManager).validatorEnableMinStake();
    deposit(contract, minRequiredStakeAmount);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 100);

    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).addValidator(validator2.address, 100);
    await stake(oneToken, validator2, cqtContract, contract, 1);
    await contract.connect(opManager).enableValidator(1);
    await stake(oneToken.mul(200), validator2, cqtContract, contract, 1);
    await stake(oneToken.mul(100), delegator2, cqtContract, contract, 1);
    totalValue = await contract.getDelegatorTotalLocked(validator2.address);
    await expect(totalValue).to.equal(oneToken.mul(201));
    totalValue = await contract.getDelegatorTotalLocked(delegator2.address);
    await expect(totalValue).to.equal(oneToken.mul(100));
  });

  it('Should return correct amounts with unstakings', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
    ] = await getAll();
    const required = oneToken.mul(10000);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    let minRequiredStakeAmount = await contract.connect(opManager).validatorEnableMinStake();
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await stake(required, validator1, cqtContract, contract, 0);
    await contract.connect(validator1).unstake(0, oneToken.mul(900));
    await contract.connect(validator1).unstake(0, oneToken.mul(9000));
    await contract.connect(validator1).unstake(0, oneToken.mul(90));
    totalValue = await contract.getDelegatorTotalLocked(validator1.address);
    await expect(totalValue).to.equal(minRequiredStakeAmount.add(required));
  });
});
