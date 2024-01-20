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

describe('Get validator compounded staking data', function() {
  it('Should return correct # of tokens staked', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    deposit(cqtContract, contract, oneToken.mul(10000));
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).addValidator(validator1.address, oneToken.div(10));
    await stake(oneToken.mul(100), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);
    let md = await contract.getValidatorCompoundedStakingData(0);
    await expect(md.staked).to.equal(oneToken.mul(100));

    await stake(oneToken.mul(200), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(100), delegator1, cqtContract, contract, 0);

    await contract.rewardValidators(1234, [0], [oneToken.mul(120)]);
    md = await contract.getValidatorCompoundedStakingData(0);
    await expect(md.staked).to.equal(oneToken.mul(381));
  });

  it('Should return correct # of tokens delegated', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).addValidator(validator1.address, oneToken.div(10));
    await stake(oneToken.mul(100), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);
    let md = await contract.getValidatorCompoundedStakingData(0);
    await expect(md.staked).to.equal(oneToken.mul(100));

    await stake(oneToken.mul(200), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(100), delegator1, cqtContract, contract, 0);

    await contract.rewardValidators(1234, [0], [oneToken.mul(120)]);
    md = await contract.getValidatorCompoundedStakingData(0);
    await expect(md.delegated).to.equal(oneToken.mul(127));
  });
});
