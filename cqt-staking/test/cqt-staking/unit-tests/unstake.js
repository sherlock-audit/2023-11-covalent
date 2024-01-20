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
} = require('../../fixtures');

describe('Unstaking', function() {
  it('Should revert when unstake is more than staked', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await deposit(cqtContract, contract, oneToken.mul(200000));
    await contract.setValidatorEnableMinStake(0);

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);
    await contract.connect(opManager).enableValidator(0);

    await expect(
      contract.connect(validator1).unstake(0, oneToken)
    ).to.revertedWith('Cannot unstake amount greater than current stake');

    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);

    await expect(
        contract.connect(validator1).unstake(0, oneToken.mul(1001)),
    ).to.revertedWith('Cannot unstake amount greater than current stake');
    await expect(
        contract.connect(validator1).unstake(0, oneToken.mul(100000)),
    ).to.revertedWith('Cannot unstake amount greater than current stake');
    await expect(
        contract.connect(validator1).unstake(0, oneToken.mul(1000).add(1)),
    ).to.revertedWith('Cannot unstake amount greater than current stake');
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
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).freezeValidator(0, "foo");
    await expect(
      contract.connect(validator1).unstake(0, oneToken)
    ).to.revertedWith('Validator is frozen');
    await contract.connect(opManager).unfreezeValidator(0);
    await contract.connect(validator1).unstake(0, oneToken);
  });


  it('Should revert when unstake amount is too small', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();

    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).setValidatorEnableMinStake(oneToken.mul(500));

    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);

    await expect(
      contract.connect(validator1).unstake(0, 1)
    ).to.revertedWith('Unstake amount is too small');
  });

  it('Should revert when unstake would result in a position below minDelegatorStake', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).setDelegatorMinStake(oneToken.mul(500));
    await contract.connect(opManager).setValidatorEnableMinStake(oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await expect(
      contract.connect(validator1).unstake(0, oneToken.mul(600))
    ).to.revertedWith('Cannot unstake to a position below delegatorMinStake (except to zero)');
  });

  it('Should disable validator when unstake results in a position below minValidatorEnableStake', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await contract.connect(opManager).setDelegatorMinStake(oneToken.mul(500));
    await contract.connect(opManager).setValidatorEnableMinStake(oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await expect(
      contract.connect(validator1).unstake(0, oneToken.mul(400))
    ).to.emit(contract, 'ValidatorDisabled');
  });

  it('Should revert when unstake beyond max cap', async function() {
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
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await contract.setMaxCapMultiplier(3);
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(3000), validator2, cqtContract, contract, 0);
    await expect(
        contract.connect(validator1).unstake(0, oneToken),
    ).to.revertedWith('Cannot decrease delegation max-cap below current delegation while validator is enabled');
    await expect(
        contract.connect(validator1).unstake(0, oneToken),
    ).to.revertedWith('Cannot decrease delegation max-cap below current delegation while validator is enabled');
  });

  it('Should unstake with safe max cap', async function() {
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
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await contract.setMaxCapMultiplier(3);
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(2000), validator2, cqtContract, contract, 0);
    await expect(await contract.connect(validator1).unstake(0, oneToken))
        .to.emit(contract, 'Unstaked')
        .withArgs(0, VALIDATOR_1, oneToken.toString(), 0);
  });

  it('Should unstake all, leaving zero remaining stake', async function() {
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
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await stake(required, validator1, cqtContract, contract, 0);
    await expect(await contract.connect(validator1).unstakeAll(0))
        .to.emit(contract, 'Unstaked')
        .withArgs(0, VALIDATOR_1, required, 0);

    let details = await contract.getValidatorMetadata(0);
    await expect(details.staked).to.equal(0);
  });

  it('Should revert when unstaking all without stake', async function() {
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
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await expect(
      contract.connect(validator1).unstakeAll(0)
    ).to.revertedWith('Already fully unstaked');
  });

  it('Should unstake beyond max cap when validator is disabled', async function() {
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
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await contract.setMaxCapMultiplier(3);
    await stake(oneToken.mul(1000), validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(3000), validator2, cqtContract, contract, 0);
    await contract.disableValidator(0);
    await expect(await contract.connect(validator1).unstake(0, oneToken))
        .to.emit(contract, 'Unstaked')
        .withArgs(0, VALIDATOR_1, oneToken.toString(), 0);
  });

  it('Should emit event when unstaked successfully', async function() {
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
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    await deposit(cqtContract, contract, oneToken.mul(2000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    await stake(required, validator1, cqtContract, contract, 0);
    await expect(await contract.connect(validator1).unstake(0, oneToken.mul(900)))
        .to.emit(contract, 'Unstaked')
        .withArgs(0, VALIDATOR_1, oneToken.mul(900).toString(), 0);
  });

  it('Should not change balance of contract or delegator', async function() {
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAll();
    await deposit(cqtContract, contract, oneToken.mul(2000000));
    await contract.connect(opManager).setValidatorEnableMinStake(0);
    const required = oneToken.mul(100);
    await contract.connect(opManager).addValidator(validator1.address, 1000000000000);
    await stake(required, validator1, cqtContract, contract, 0);
    await contract.connect(opManager).enableValidator(0);
    const oldValidatorBalance = await cqtContract.balanceOf(VALIDATOR_1);
    const oldContractBalance = await cqtContract.balanceOf(contract.address);
    await contract.connect(validator1).unstake(0, oneToken.mul(90));
    await expect(await cqtContract.balanceOf(VALIDATOR_1)).to.equal(
        oldValidatorBalance,
    );
    await expect(await cqtContract.balanceOf(contract.address)).to.equal(
        oldContractBalance,
    );
  });

  it('Should revert when validator is invalid', async function() {
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
    await deposit(cqtContract, contract, oneToken.mul(20));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 1000000000000);
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await expect(contract.connect(validator1).unstake(1, amount)).to.revertedWith(
        'Invalid validator',
    );
    await expect(contract.connect(validator1).unstake(2, oneToken)).to.revertedWith(
        'Invalid validator',
    );
  });
});
