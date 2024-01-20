
const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChainAndStaking,
    confirmInputsWithProofChain
} = require('./contractPrompt.js');

const STAKING_ADDRESS = '';
const PROOFCHAIN_OLD = '';
const PROOFCHAIN_NEW = '';
const DEFAULT_VALUES = [];
const VALUE_NAMES = [];

async function main() {
    const [owner] = await ethers.getSigners();

    let result1 = await confirmInputsWithProofChain(
        owner,
        "Getting data from old ProofChain",
        PROOFCHAIN_OLD,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result1.confirmed) {
        const proofChainOld = result1.proofChain;
        let result2 = await confirmInputsWithProofChainAndStaking(
            owner,
            "Getting new ProofChain and Staking",
            STAKING_ADDRESS,
            PROOFCHAIN_NEW,
            VALUE_NAMES,
            DEFAULT_VALUES
        );

        if (result2.confirmed) {
            const proofChainNew = result2.proofChain;
            const stakingContract = result2.staking;
            let validatorsN = (await stakingContract.getMetadata())._validatorsN; // use this id for new validator


            for (let validatorId = 0; validatorId < validatorsN; validatorId++) {
                let operators = await proofChainOld.getOperators(validatorId);
                for (let i = 0; i < operators.length; i++) {
                    let operator = operators[i];
                    console.log("Adding:", "operator - ", operator, "validator id - ", validatorId);
                    await proofChainNew.connect(owner).addBSPOperator(operator, validatorId);
                }
            }

            for (let validatorId = 0; validatorId < validatorsN; validatorId++) {
                let operators = await proofChainNew.getOperators(validatorId);
                let address = (await stakingContract.getValidatorMetadata(validatorId))._address;

                for (let i = 0; i < operators.length; i++) {
                    let operator = operators[i];
                    console.log("Added:", "operator - ", operator, "validator id - ", validatorId, "validator address - ", address);
                }
            }

        }
    }
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });