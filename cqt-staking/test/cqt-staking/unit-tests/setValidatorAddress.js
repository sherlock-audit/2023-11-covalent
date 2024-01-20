const {expect} = require('chai');
const {
  getAll,
  getDeployedContract,
  getRewardsLocked,
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
  stake,
  addStakedValidator,
  deposit,
} = require('../../fixtures');

describe('Set validator address', function() {
  it('Should change staking validator address.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    let details = await contract.getValidatorMetadata(0);
    await expect(details._address).to.equal(VALIDATOR_1);

    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1);
    details = await contract.getValidatorMetadata(0);
    await expect(details._address).to.equal(OPERATOR_1);
  });


  it('Should transfer rewards.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await stake(oneToken.mul(10), validator1, cqtContract, contract, 0)
    await deposit(cqtContract, contract, oneToken)
    await contract.connect(opManager).rewardValidators(1234, [0],[oneToken])
    let reward = oneToken.sub(oneToken.div(10))
    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.rewards).to.equal(reward);

    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.rewards).to.equal(0);

    details = await contract.getDelegatorMetadata(OPERATOR_1, 0)
    await expect(details.rewards).to.equal(reward);
  });


  it('Should transfer stakings.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken, validator1, cqtContract, contract, 0)
    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(oneToken);

    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(0);

    details = await contract.getDelegatorMetadata(OPERATOR_1, 0)
    await expect(details.staked).to.equal(oneToken);
  });

  it('Should transfer unstakings.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(30), validator1, cqtContract, contract, 0);
    await contract.connect(validator1).unstake(0, oneToken);
    await contract.connect(validator1).unstake(0, oneToken.mul(20));
    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(oneToken.mul(9));
    let cooldown1 = details.unstakingsEndEpochs[0]
    let cooldown2 = details.unstakingsEndEpochs[1]

    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(0);
    await expect(details.unstakingAmounts.length).to.equal(0);
    await expect(details.unstakingsEndEpochs.length).to.equal(0);

    details = await contract.getDelegatorMetadata(OPERATOR_1, 0)
    await expect(details.staked).to.equal(oneToken.mul(9));
    await expect(details.unstakingAmounts[0]).to.equal(oneToken);
    await expect(details.unstakingAmounts[1]).to.equal(oneToken.mul(20));
    await expect(details.unstakingsEndEpochs[0]).to.equal(cooldown1);
    await expect(details.unstakingsEndEpochs[1]).to.equal(cooldown2);
  });

  it('Should emit ValidatorAddressChanged event with correct address.', async function() {
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
    await expect(await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1))
    .to.emit(contract, 'ValidatorAddressChanged')
        .withArgs(0, OPERATOR_1);

    await addStakedValidator(1, contract, cqtContract, opManager, validator2, 10);
    await expect(await contract.connect(validator2).setValidatorAddress(1, OPERATOR_2))
    .to.emit(contract, 'ValidatorAddressChanged')
        .withArgs(1, OPERATOR_2);
  });


  it('Should not access setValidatorAddress by not validator.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);

    await expect(
        contract.connect(validator2).setValidatorAddress(0, OPERATOR_1)
    ).to.be.revertedWith("Sender is not the validator");

    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1)

    await expect(
        contract.connect(validator1).setValidatorAddress(0, OPERATOR_1)
    ).to.be.revertedWith("Sender is not the validator");
  });



  it('Should revert when the new address is 0.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await expect(
        contract.connect(validator1).setValidatorAddress(0, "0x0000000000000000000000000000000000000000")
    ).to.be.revertedWith("Invalid validator address");
  });

  it('Should revert when the new address is the old one.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await expect(
        contract.connect(validator1).setValidatorAddress(0, VALIDATOR_1)
    ).to.be.revertedWith("The new address cannot be equal to the current validator address");
  });

  it('Should revert when the validator id is invalid.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await expect(
        contract.connect(validator1).setValidatorAddress(10, VALIDATOR_1)
    ).to.be.revertedWith("Sender is not the validator");
  });

  it('Should revert when validator is frozen', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await contract.connect(opManager).freezeValidator(0, "foo");
    await expect(
      contract.connect(validator1).setValidatorAddress(0, VALIDATOR_2)
    ).to.be.revertedWith("Validator is frozen");
  });

  it('Should transfer unstakings when the max amount is used.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(3000), validator1, cqtContract, contract, 0);
    let N = 300
    for(let i = 0; i<N; i++){
      await contract.connect(validator1).unstake(0, oneToken);
    }
    await contract.connect(validator1).setValidatorAddress(0, OPERATOR_1);

  });

  it('Should revert when more than the max amount of unstakings is used.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(3000), validator1, cqtContract, contract, 0);
    let N = 301
    for(let i = 0; i<N; i++){
      await contract.connect(validator1).unstake(0, oneToken);
    }
    await expect(
      contract.connect(validator1).setValidatorAddress(0, VALIDATOR_2)
  ).to.be.revertedWith("Cannot transfer more than 300 unstakings");
  });


  it('Should transfer and merge rewards.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, oneToken.div(10));
    await stake(oneToken.mul(10), validator1, cqtContract, contract, 0)
    await deposit(cqtContract, contract, oneToken.mul(10))
    await contract.connect(opManager).rewardValidators(1234, [0],[oneToken])
    let reward = oneToken.sub(oneToken.div(10))
    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.rewards).to.equal(reward);

    await stake(oneToken.mul(10), validator2, cqtContract, contract, 0)
    await contract.connect(opManager).rewardValidators(1234, [0],[oneToken])

    await contract.connect(validator1).setValidatorAddress(0, VALIDATOR_2);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.rewards).to.equal(0);

    details = await contract.getDelegatorMetadata(VALIDATOR_2, 0)
    await expect(details.rewards).to.closeTo(reward.mul(2), 10000);
  });

  it('Should transfer and merge stakings.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken, validator1, cqtContract, contract, 0)
    await stake(oneToken, validator2, cqtContract, contract, 0)
    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(oneToken);

    await contract.connect(validator1).setValidatorAddress(0, VALIDATOR_2);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(0);

    details = await contract.getDelegatorMetadata(VALIDATOR_2, 0)
    await expect(details.staked).to.equal(oneToken.mul(2));
  });

  it('Should transfer and merge unstakings.', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await contract.connect(opManager).setStakingManagerAddress(opManager.address);
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 10);
    await stake(oneToken.mul(300), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(30), validator2, cqtContract, contract, 0);
    await contract.connect(validator1).unstake(0, oneToken.mul(2));
    await contract.connect(validator1).unstake(0, oneToken.mul(10));


    await contract.connect(validator2).unstake(0, oneToken);
    await contract.connect(validator2).unstake(0, oneToken.mul(20));

    let details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(oneToken.mul(288));
    let cooldown1 = details.unstakingsEndEpochs[0]
    let cooldown2 = details.unstakingsEndEpochs[1]

    let details2 = await contract.getDelegatorMetadata(VALIDATOR_2, 0)
    await expect(details2.staked).to.equal(oneToken.mul(9));
    let cooldown3 = details2.unstakingsEndEpochs[0]
    let cooldown4 = details2.unstakingsEndEpochs[1]

    await contract.connect(validator1).setValidatorAddress(0, VALIDATOR_2);
    details = await contract.getDelegatorMetadata(VALIDATOR_1, 0)
    await expect(details.staked).to.equal(0);
    await expect(details.unstakingAmounts.length).to.equal(0);
    await expect(details.unstakingsEndEpochs.length).to.equal(0);

    details = await contract.getDelegatorMetadata(VALIDATOR_2, 0)
    await expect(details.staked).to.equal(oneToken.mul(297));
    await expect(details.unstakingAmounts[0]).to.equal(oneToken);
    await expect(details.unstakingAmounts[1]).to.equal(oneToken.mul(20));
    await expect(details.unstakingsEndEpochs[0]).to.equal(cooldown3);
    await expect(details.unstakingsEndEpochs[1]).to.equal(cooldown4);

    await expect(details.unstakingAmounts[2]).to.equal(oneToken.mul(2));
    await expect(details.unstakingAmounts[3]).to.equal(oneToken.mul(10));
    await expect(details.unstakingsEndEpochs[2]).to.equal(cooldown1);
    await expect(details.unstakingsEndEpochs[3]).to.equal(cooldown2);
  });

});

