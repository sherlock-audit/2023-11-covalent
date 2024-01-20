const {expect} = require('chai');
const {ethers} = require('hardhat');

const {
  stake,
  deposit,
  getAllWithCoolDown,
  mineBlocks,
  getOwner,
  setCoolDown,
  getValidatorCoolDown,
  getDelegatorCoolDown,
  oneToken,
  OWNER,
  VALIDATOR_1,
  VALIDATOR_2,
  OPERATOR_1,
  CQT_ETH_MAINNET,
  OPERATOR_2,
  DELEGATOR_1,
  DELEGATOR_2,
  CQT,
  addStakedValidator,
} = require('../../fixtures');

describe('Transfer Unstaked', function() {
  it('Should transfer out after cool down ends, delegator', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(10000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 0, amountIn.toString());

    amountIn = oneToken.mul(1000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 1),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 1, amountIn.toString());
  });

  it('Should transfer out after cool down ends, validator', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(10000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator1, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(500);
    await expect(
        await contract.connect(validator1).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 0, amountIn.toString());

    amountIn = oneToken.mul(1000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(500);
    await expect(
        await contract.connect(validator1).transferUnstakedOut(amountIn, 0, 1),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 1, amountIn.toString());
  });

  it('Should transfer out partially', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(10000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator1, cqtContract, contract, 0);
    await mineBlocks(100);
    const amountIn = oneToken.mul(7000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(500);
    await expect(
        await contract
            .connect(validator1)
            .transferUnstakedOut(amountIn.div(2), 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 0, amountIn.div(2).toString());
    await expect(
        await contract
            .connect(validator1)
            .transferUnstakedOut(amountIn.div(2), 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 0, amountIn.div(2).toString());
  });

  it('Should change balance of the contract and the owner.', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(10000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);

    let amountIn = oneToken.mul(7000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    let oldContractBalance = await cqtContract.balanceOf(contract.address);
    let oldStakerBalance = await cqtContract.balanceOf(validator2.address);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 0, amountIn.toString());
    await expect(await cqtContract.balanceOf(contract.address)).to.equal(
        oldContractBalance.sub(amountIn),
    );
    await expect(await cqtContract.balanceOf(validator2.address)).to.equal(
        oldStakerBalance.add(amountIn),
    );

    amountIn = oneToken.mul(1000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    oldContractBalance = await cqtContract.balanceOf(contract.address);
    oldStakerBalance = await cqtContract.balanceOf(validator2.address);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 1),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 1, amountIn.toString());
    await expect(await cqtContract.balanceOf(contract.address)).to.equal(
        oldContractBalance.sub(amountIn),
    );
    await expect(await cqtContract.balanceOf(validator2.address)).to.equal(
        oldStakerBalance.add(amountIn),
    );
  });

  it('Should transfer out after cool down ends, validator', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(8000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator1, cqtContract, contract, 0);
    await mineBlocks(500);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(500);
    await expect(
        await contract.connect(validator1).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 0, amountIn.toString());

    amountIn = oneToken.mul(1000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(500);
    await expect(
        await contract.connect(validator1).transferUnstakedOut(amountIn, 0, 1),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator1.address, 1, amountIn.toString());
  });

  it('Should revert with wrong unstaking id', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Unstaking does not exist');
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 1),
    ).to.revertedWith('Unstaking does not exist');
    amountIn = oneToken.mul(1000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 2),
    ).to.revertedWith('Unstaking does not exist');
  });

  it('Should revert when the transfer amount is higher than unstaked', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 500;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 0, amountIn.toString());
    amountIn = oneToken.mul(1000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Amount is too high');
  });

  it('Should revert when trying to attempt transfer the same unstake twice', async function() {
    const delegatorCoolDown = 1;
    const validatorCoolDown = 5;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);
    const amountIn = oneToken.mul(7000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        await contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    )
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, validator2.address, 0, amountIn.toString());
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Amount is too high');
  });

  it('Should revert when cool down did not end, delegator', async function() {
    const delegatorCoolDown = 1000;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator2, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Cooldown period has not ended');
    amountIn = oneToken.mul(1000);
    await contract.connect(validator2).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator2).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Cooldown period has not ended');
  });

  it('Should revert when cool down did not end, validator', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator1, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator1).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Cooldown period has not ended');
    amountIn = oneToken.mul(1000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator1).transferUnstakedOut(amountIn, 0, 0),
    ).to.revertedWith('Cooldown period has not ended');
  });


  it('Should revert when given invalid validator id', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );
    deposit(contract, oneToken.mul(100000));
    await addStakedValidator(
        0,
        contract,
        cqtContract,
        opManager,
        validator1,
        1000000000000,
    );
    const amount = oneToken.mul(1000);
    await stake(amount, validator1, cqtContract, contract, 0);
    await stake(oneToken.mul(8000), validator1, cqtContract, contract, 0);
    await mineBlocks(100);
    let amountIn = oneToken.mul(7000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator1).transferUnstakedOut(amountIn, 100, 0),
    ).to.revertedWith('Invalid validator');
    amountIn = oneToken.mul(1000);
    await contract.connect(validator1).unstake(0, amountIn);
    await mineBlocks(100);
    await expect(
        contract.connect(validator1).transferUnstakedOut(amountIn, 10, 0),
    ).to.revertedWith('Invalid validator');
  });

  it('Should allow immediate unstaking when delegator cooldown is set to 0', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );

    const required = oneToken.mul(1000);
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 0);
    await stake(required, validator1, cqtContract, contract, 0);
    await stake(required, delegator1, cqtContract, contract, 0);

    unstakeAmount = oneToken.mul(900);

    await setCoolDown(false, contract, 0);  // set delegator cooldown to 0
    await contract.connect(delegator1).unstake(0, unstakeAmount);
    res = await contract.connect(delegator1).transferUnstakedOut(unstakeAmount, 0, 0);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, DELEGATOR_1, 0, unstakeAmount.toString());
  });

  it('Should allow immediate unstaking when validator cooldown is set to 0', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );

    const required = oneToken.mul(1000);
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 0);
    await stake(required, validator1, cqtContract, contract, 0);

    unstakeAmount = oneToken.mul(900);

    await setCoolDown(true, contract, 0);  // set validator cooldown to 0
    await contract.connect(validator1).unstake(0, unstakeAmount);
    res = await contract.connect(validator1).transferUnstakedOut(unstakeAmount, 0, 0);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, VALIDATOR_1, 0, unstakeAmount.toString());
  });


  it('Should allow updated unstaking period, while previous unstaking periods remain the same (when delegator cooldown is changed)', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );

    const required = oneToken.mul(1000);
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 0);
    await stake(required, validator1, cqtContract, contract, 0);
    await stake(required, delegator1, cqtContract, contract, 0);

    unstakeAmount1 = oneToken.mul(300);
    initialDelegatorCoolDown = await getDelegatorCoolDown(contract);
    await contract.connect(delegator1).unstake(0, unstakeAmount1);

    unstakeAmount2 = oneToken.mul(200);
    await setCoolDown(false, contract, initialDelegatorCoolDown * 2);
    await contract.connect(delegator1).unstake(0, unstakeAmount2);
    await mineBlocks(initialDelegatorCoolDown);

    // should be able to unstake the first unstake immediately, but not the second

    res = await contract.connect(delegator1).transferUnstakedOut(unstakeAmount1, 0, 0);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, DELEGATOR_1, 0, unstakeAmount1.toString());

    await expect(
        contract.connect(delegator1).transferUnstakedOut(unstakeAmount2, 0, 1)
        ).to.revertedWith('Cooldown period has not ended');

    await mineBlocks(initialDelegatorCoolDown);
    res = await contract.connect(delegator1).transferUnstakedOut(unstakeAmount2, 0, 1);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, DELEGATOR_1, 1, unstakeAmount2.toString());
  });


  it('Should allow updated unstaking period, while previous unstaking periods remain the same (when validator cooldown is changed)', async function() {
    const delegatorCoolDown = 100;
    const validatorCoolDown = 5000;
    const [
      opManager,
      contract,
      cqtContract,
      validator1,
      validator2,
      delegator1,
      delegator2,
    ] = await getAllWithCoolDown(
        CQT_ETH_MAINNET,
        delegatorCoolDown,
        validatorCoolDown,
        10,
        oneToken.mul(1000000),
    );

    const required = oneToken.mul(1000);
    await deposit(cqtContract, contract, oneToken.mul(1000));
    await addStakedValidator(0, contract, cqtContract, opManager, validator1, 0);
    await stake(required, validator1, cqtContract, contract, 0);

    unstakeAmount1 = oneToken.mul(300);
    initialValidatorCooldown = await getValidatorCoolDown(contract);
    await contract.connect(validator1).unstake(0, unstakeAmount1);

    unstakeAmount2 = oneToken.mul(200);
    await setCoolDown(true, contract, initialValidatorCooldown * 2);
    await contract.connect(validator1).unstake(0, unstakeAmount2);
    await mineBlocks(initialValidatorCooldown);

    // should be able to unstake the first unstake immediately, but not the second

    res = await contract.connect(validator1).transferUnstakedOut(unstakeAmount1, 0, 0);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, VALIDATOR_1, 0, unstakeAmount1.toString());

    await expect(
        contract.connect(validator1).transferUnstakedOut(unstakeAmount2, 0, 1)
        ).to.revertedWith('Cooldown period has not ended');

    await mineBlocks(initialValidatorCooldown);

    res = await contract.connect(validator1).transferUnstakedOut(unstakeAmount2, 0, 1);
    await expect(res)
        .to.emit(contract, 'UnstakeRedeemed')
        .withArgs(0, VALIDATOR_1, 1, unstakeAmount2.toString());
  });
});
