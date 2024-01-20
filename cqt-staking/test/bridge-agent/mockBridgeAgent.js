const { BLOCK_RESULT_PRODUCER_ROLE, BLOCK_SPECIMEN_PRODUCER_ROLE } = require("../fixtures");


class MockBridgeAgent {
    constructor(stakingContract, proofChain, owner, stakingManager) {
        this.stakingContract = stakingContract;
        this.proofChain = proofChain;
        this.owner = owner;
        this.stakingManager = stakingManager;
    }

    setup() {
        let owner = this.owner;
        let stakingContract = this.stakingContract;
        let proofChain = this.proofChain;
        let stakingManager = this.stakingManager;

        proofChain.on("OperatorAdded", async (_operatorAddress, validatorID, role, _event) => {
            if (role != BLOCK_RESULT_PRODUCER_ROLE && role != BLOCK_SPECIMEN_PRODUCER_ROLE) {
                return;
            }

            await stakingContract.connect(stakingManager).enableValidator(validatorID);
        })

        stakingContract.on("ValidatorEnabled", async (validatorID, _event) => {
            await proofChain.connect(stakingManager).enableValidator(validatorID);
        });

        proofChain.on("OperatorRemoved", async (_operatorAddress, validatorID, activeValidatorCount, role, _event) => {
            if (role != BLOCK_RESULT_PRODUCER_ROLE && role != BLOCK_SPECIMEN_PRODUCER_ROLE) {
                return;
            }

            if (activeValidatorCount == 0) {
                await stakingContract.connect(stakingManager).disableValidator(validatorID);
            }
        });

        stakingContract.on("ValidatorDisabled", async (validatorID, _blockN, _event) => {
            await proofChain.connect(stakingManager).disableValidator(validatorID);
        });

        stakingContract.on("Staked", async (validatorID, _staker, _amount, _event) => {
            // Staked can trigger a validator to be enabled if brp/bsp operator is enabled 
            // and validator was disabled before
            const isEnabled = await proofChain.connect(stakingManager).isValidatorEnabled(validatorID);
            const activeOperatorCount = await proofChain.connect(stakingManager).getEnabledOperatorCount(validatorID);
            if (!isEnabled) {
                if (activeOperatorCount > 0) {
                    await stakingContract.connect(stakingManager).enableValidator(validatorID);
                }
            } else if (activeOperatorCount > 0) {
                // operator is enabled on PC but maybe not on SC
                // ideally should be enabled on SC as well, that's why the check
                const isValidatorEnabled = await stakingContract.connect(stakingManager).isValidatorEnabled(validatorID);
                if (!isValidatorEnabled) {
                    await stakingContract.connect(stakingManager).enableValidator(validatorID);
                }
            }
        });

        return stakingContract, proofChain;
    }
}

exports.MockBridgeAgent = MockBridgeAgent;