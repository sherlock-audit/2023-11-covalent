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
} = require('../../fixtures');

describe('Underflow protection', function() {
  it('Redeeming rewards should revert on underflow', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    deposit(cqtContract, contract, oneToken.mul(100000));
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setDelegatorMinStake(0);

    const v1Commission = oneToken.div(2);
    await contract.connect(opManager).addValidator(VALIDATOR_1, v1Commission);

    const tokensStaked = oneToken.mul(1000);

    await stake(tokensStaked, validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);

    await contract.connect(validator1).unstake(0, tokensStaked.sub(1));

    await contract.connect(opManager).rewardValidators(1234, [0], [tokensStaked]);

    // now v.exchangeRate should be something like 159717633079061536537625392568231788544,
    // making _sharesToTokens(v.shares) 159717633079061536537 despite v.shares being 1

    const REWARD_REDEEM_THRESHOLD = Math.pow(10, 8);

    await expect(
        contract.connect(validator1).redeemRewards(0, validator1.address, REWARD_REDEEM_THRESHOLD),
    ).to.revertedWith('Underflow error');
  });

  it('Unstaking should revert on underflow', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    deposit(cqtContract, contract, oneToken.mul(100000));
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setDelegatorMinStake(0);

    const v1Commission = oneToken.div(2);
    await contract.connect(opManager).addValidator(VALIDATOR_1, v1Commission);

    const tokensStaked = oneToken.mul(1000);

    await stake(tokensStaked, validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);

    await contract.connect(validator1).unstake(0, tokensStaked.sub(1));

    await contract.connect(opManager).rewardValidators(1234, [0], [tokensStaked]);

    // now v.exchangeRate should be something like 159717633079061536537625392568231788544,
    // making _sharesToTokens(v.shares) 159717633079061536537 despite v.shares being 1

    const REWARD_REDEEM_THRESHOLD = Math.pow(10, 8);

    await expect(
        contract.connect(validator1).unstake(0, 1),
    ).to.revertedWith('Underflow error');
  });
});
