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

describe('Get delegator metadata', function() {
  it('Should return correct # of tokens staked by validator', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    let minRequiredStakeAmount = await contract.connect(opManager).validatorEnableMinStake();
    deposit(contract, minRequiredStakeAmount);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 100);
    let md = await contract.getDelegatorMetadata(validator1.address, 0);
    await expect(md.staked).to.equal(minRequiredStakeAmount);

    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).addValidator(validator2.address, 100);
    await stake(oneToken, validator2, cqtContract, contract, 1);
    await contract.connect(opManager).enableValidator(1);
    await stake(oneToken.mul(200), validator2, cqtContract, contract, 1);
    await stake(oneToken.mul(100), delegator2, cqtContract, contract, 1);
    md = await contract.getDelegatorMetadata(validator2.address, 1);
    await expect(md.staked).to.equal(oneToken.mul(201));
  });

  it('Should return correct # of tokens staked by delegator', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(oneToken);
    await contract.connect(opManager).addValidator(validator1.address, 100);
    await stake(oneToken, validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);

    await stake(oneToken, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(200), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(100), delegator1, cqtContract, contract, 0);
    md = await contract.getDelegatorMetadata(delegator1.address, 0);
    await expect(md.staked).to.equal(oneToken.mul(100));

    await stake(oneToken.mul(200), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(400), delegator1, cqtContract, contract, 0);
    md = await contract.getDelegatorMetadata(delegator1.address, 0);
    await expect(md.staked).to.equal(oneToken.mul(500));
  });

  it('Should return correct amounts of unstakings', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    const required = oneToken.mul(10000);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await stake(required, validator1, cqtContract, contract, 0);
    await contract.connect(validator1).unstake(0, oneToken.mul(900));
    await contract.connect(validator1).unstake(0, oneToken.mul(9000));
    await contract.connect(validator1).unstake(0, oneToken.mul(90));
    md = await contract.getDelegatorMetadata(validator1.address, 0);
    await expect(md.unstakingAmounts[0]).to.equal(oneToken.mul(900));
    await expect(md.unstakingAmounts[1]).to.equal(oneToken.mul(9000));
    await expect(md.unstakingAmounts[2]).to.equal(oneToken.mul(90));
  });

  it('Should return correct end epochs of unstakings', async function() {
    const [
      owner,
      _contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    const contract = await deployStaking([
        cqtContract.address,
        10,
        20,
        5,
        oneToken.mul(1000000)
    ])
    await contract.connect(owner).setStakingManagerAddress(owner.address)

    const required = oneToken.mul(10000);
    await contract.setMaxCapMultiplier(20);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        owner,
        validator1,
        1000000000000,
    );
    await stake(required, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(1000), delegator1, cqtContract, contract, 0);
    const r1 = await contract.connect(validator1).unstake(0, oneToken.mul(900));
    const r2 = await contract
        .connect(validator1)
        .unstake(0, oneToken.mul(9000));
    const r3 = await contract.connect(delegator1).unstake(0, oneToken.mul(90));
    md = await contract.getDelegatorMetadata(validator1.address, 0);
    await expect(md.unstakingsEndEpochs[0]).to.equal(r1.blockNumber + 20);
    await expect(md.unstakingsEndEpochs[1]).to.equal(r2.blockNumber + 20);

    md = await contract.getDelegatorMetadata(delegator1.address, 0);
    await expect(md.unstakingsEndEpochs[0]).to.equal(r3.blockNumber + 10);
  });


  it('Should revert when validator id is invalid', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 100);
    await expect(contract.getDelegatorMetadata(delegator1.address, 1)).to.revertedWith("Invalid validator");
    await expect(contract.getDelegatorMetadata(delegator1.address, 10)).to.revertedWith("Invalid validator");
  });


});
