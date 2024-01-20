const { ethers } = require('hardhat');
const { confirmInputs } = require('../scripts/contractPrompt.js');
const {
    getStakingContract,
    getCQTContractFromAddress
} = require('../test/fixtures.js');
const cqtFaucetAbi = require('../generated-abis/ugly/CovalentQueryTokenFaucet.json');
const oneToken = ethers.BigNumber.from('1000000000000000000');


const DEFAULT_VALUES = ["", "", "1000"];
const VALUE_NAMES = ["cqt token address", "staking contract", "token amount"];

async function main() {
    const [cqtOwner, contractDeployer, scManager, v1, op1_1, op1_2, v2, op2_1, v_bak, v3] = await ethers.getSigners();

    let result = await confirmInputs("deposit tokens", VALUE_NAMES, DEFAULT_VALUES);
    if (result.confirmed) {
        const [cqtAddress, stakingAddress, amount] = result.values;
        let contract = await getStakingContract(scManager, stakingAddress);
        let scaledAmount = oneToken.mul(ethers.BigNumber.from(amount));
        console.log('owner is:', contractDeployer.address);

        const cqt = await getCQTContractFromAddress(cqtOwner, cqtAddress);
        const tx = await cqt.connect(contractDeployer).approve(contract.address, scaledAmount);
        console.log(await tx.wait());


        result = await contract.connect(contractDeployer).depositRewardTokens(scaledAmount);
        console.log(await result.wait());
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });