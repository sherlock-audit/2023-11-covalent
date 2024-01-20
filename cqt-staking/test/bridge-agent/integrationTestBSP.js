const {
    setupWithDefaultParameters,
    oneToken,
    BLOCK_SPECIMEN_PRODUCER_ROLE,
} = require('../fixtures.js');
const { MockBridgeAgent } = require('./mockBridgeAgent.js');
const { expect } = require('chai');
var assert = require("assert");


describe('Test BSP contract and staking contract interaction via bridge agent', function () {
    beforeEach(async function () {
        [contractsAndAccounts, parameters] = await setupWithDefaultParameters({ withProofChain: 'BlockSpecimen' });
        [
            owner,
            stakingContract,
            cqtContract,
            proofChain,
            validators,
            operators,
            delegators,
            stakingManager,
        ] = contractsAndAccounts;

        commissionRate = BigInt(10 ** 17);
        stakeAmount = oneToken.mul(150);

        await stakingContract.connect(owner).setValidatorEnableMinStake(oneToken.mul(5));

        mockBridgeAgent = new MockBridgeAgent(stakingContract, proofChain, owner, stakingManager);
        stakingContract, proofChain = mockBridgeAgent.setup();
    });

    it('calls enableValidator on SC, triggers the same on PC', async function () {
        validator = validators[0];
        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await stakingContract.connect(validator).stake(0, stakeAmount);

        await stakingContract.connect(stakingManager).enableValidator(0);
        await waitForEvent(proofChain, "ValidatorEnabled", [0]);
    });

    it('calls disableValidator on SC, triggers the same on PC', async function () {
        validator = validators[0];
        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await stakingContract.connect(validator).stake(0, stakeAmount);
        await stakingContract.connect(stakingManager).enableValidator(0);

        await stakingContract.connect(stakingManager).disableValidator(0);
        await waitForEvent(proofChain, "ValidatorDisabled", [0]);
    });

    it('calls addBSPOperator on PC, triggers enableValidator on SC (sufficient stake), which triggers enableValidator on PC', async function () {
        validator = validators[1];
        operator = operators[1];
        // test with 1 index rather than 0 (making sure that test doesn't pass due to some default value of 0 somewhere)
        await stakingContract.connect(stakingManager).addValidator(validators[0].address, commissionRate);

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);

        await stakingContract.connect(validator).stake(1, stakeAmount);

        await proofChain.connect(owner).addBSPOperator(operator.address, 1);

        // expectations
        await waitForEvent(stakingContract, "ValidatorEnabled", [1]);
        await waitForEvent(proofChain, "ValidatorEnabled", [1]);
    });

    it('calls addBSPOperator on PC, triggers enableValidator on SC (but fails when insufficient stake), and doesn\'t trigger enableValidator on PC', async function () {
        validator = validators[1];
        operator = operators[1];
        // test with 1 index rather than 0 (making sure that test doesn't pass due to some default value of 0 somewhere)
        await stakingContract.connect(stakingManager).addValidator(validators[0].address, commissionRate);

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);

        // no stake
        await proofChain.connect(owner).addBSPOperator(operator.address, 1);

        await ensureNoEvent(stakingContract, "ValidatorEnabled");
        await ensureNoEvent(proofChain, "ValidatorEnabled");
    });

    it('call removeBSPOperator on PC, activeOpCount=0, triggers disableValidator on SC, and the same on PC', async function () {
        validator = validators[0];
        operator1 = operators[0];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await stakingContract.connect(validator).stake(0, stakeAmount);

        await proofChain.connect(owner).addBSPOperator(operator1.address, 0);

        await waitForEvent(proofChain, "ValidatorEnabled", [0]);

        await proofChain.connect(owner).removeBSPOperator(operator1.address);
        await waitForEvent(stakingContract, "ValidatorDisabled", [0]);
        await waitForEvent(proofChain, "ValidatorDisabled", [0]);
    });

    it('call removeBSPOperator on PC, activeOpCount>0, triggers nothing on SC', async function () {
        validator = validators[0];
        operator1 = operators[0];
        operator2 = operators[1];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await stakingContract.connect(validator).stake(0, stakeAmount);

        await proofChain.connect(owner).addBSPOperator(operator1.address, 0);
        await proofChain.connect(owner).addBSPOperator(operator2.address, 0);

        await proofChain.connect(owner).removeBSPOperator(operator1.address);
        await ensureNoEvent(stakingContract, "ValidatorDisabled");
    });

    it('SC.unstake, triggers disable validator, and then PC.disableValidator', async function () {
        validator = validators[0];
        operator1 = operators[0];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await stakingContract.connect(validator).stake(0, stakeAmount);

        await proofChain.connect(owner).addBSPOperator(operator1.address, 0);

        await waitForEvent(proofChain, "ValidatorEnabled", [0]);

        await stakingContract.connect(validator).unstakeAll(0);
        await waitForEvent(stakingContract, "ValidatorDisabled", [0]);
        await waitForEvent(proofChain, "ValidatorDisabled", [0]);
    });

    it('SC.stake should trigger enableValidator on SC if proofchain.validator is enabled + active operators are there', async function () {
        validator = validators[0];

        operator1 = operators[0];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);

        await proofChain.connect(owner).addBSPOperator(operator1.address, 0);

        await waitForEvent(proofChain, "OperatorAdded", [operator1.address, 0, BLOCK_SPECIMEN_PRODUCER_ROLE]);
        await ensureNoEvent(stakingContract, "ValidatorEnabled");

        // stake
        await stakingContract.connect(validator).stake(0, stakeAmount);
        await waitForEvent(stakingContract, "ValidatorEnabled", [0]);
    });

    it('SC.stake shouldn\'t trigger SC.enableValidator if proofchain.validator is enabled + but no active operators', async function () {
        validator = validators[0];

        operator1 = operators[0];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        // no active operators
        //proofChain.connect(owner).addBSPOperator(operator1.address, 0);
        // await proofChain.connect(validator).enableBSPOperator(operator1.address);

        // stake
        await stakingContract.connect(validator).stake(0, stakeAmount);
        await ensureNoEvent(stakingContract, "ValidatorEnabled");
    });

    it('SC.stake and enabled on PC + SC, shouldn\'t trigger enableValidator on SC', async function () {
        validator = validators[0];

        operator1 = operators[0];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);

        await proofChain.connect(owner).addBSPOperator(operator1.address, 0);

        await waitForEvent(proofChain, "OperatorAdded", [operator1.address, 0, BLOCK_SPECIMEN_PRODUCER_ROLE]);

        // stake
        await stakingContract.connect(validator).stake(0, stakeAmount);
        await waitForEvent(stakingContract, "ValidatorEnabled", [0]);

        // stake again
        await stakingContract.connect(validator).stake(0, stakeAmount);
        await ensureNoEvent(stakingContract, "ValidatorEnabled");
    });

    async function waitForEvent(contract, eventName, eventArgs) {
        let resP, rejP, timeoutId;
        pEvent = new Promise((resolve, reject) => {
            resP = resolve;
            rejP = reject;
            timeoutId = setTimeout(() => {
                rejP(new Error("timeout while waiting for event! (address, eventName, args):" + contract.address + "," + eventName + "," + eventArgs));
            }, 20_000);
        });

        contract.once(eventName, async () => {
            clearTimeout(timeoutId);
            resP();
        });

        return pEvent;
    }

    async function ensureNoEvent(contract, eventName) {
        // etherjs has no "revert" listener for contract, so we have to use this workaround 
        // where timeout => success, and event => failure

        let resP, rejP, timeoutId;
        pEvent = new Promise((resolve, reject) => {
            resP = resolve;
            rejP = reject;
            timeoutId = setTimeout(() => {
                // event is not called
                resP();
            }, 40_000);
        });

        contract.once(eventName, async () => {
            clearTimeout(timeoutId);
            rejP(new Error("event was called!" + eventName + "," + contract.address));
        });

        return pEvent;
    }
});

