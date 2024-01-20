const { ethers } = require('hardhat');
const { confirmInputs } = require('../scripts/contractPrompt.js');
const cqtFaucetAbi = require('../generated-abis/ugly/CovalentQueryTokenFaucet.json');
const oneToken = ethers.BigNumber.from('1000000000000000000');

const DEFAULT_VALUES = ["", "", 1000000];
const VALUE_NAMES = ["cqt faucet address", "receiver address", "amount of cqt"];

async function main() {
    const [cqtOwner, contractDeployer, scManager, v1, op1_1, op1_2, v2, op2_1, v_bak, v3] = await ethers.getSigners();

    let result = await confirmInputs("grant cqt", VALUE_NAMES, DEFAULT_VALUES);
    if (result.confirmed) {
        const [faucetAddress, receiverAddress, amount] = result.values;
        const cqtFaucetContract = await new ethers.Contract(faucetAddress, cqtFaucetAbi, cqtOwner);
        let scaledAmount = oneToken.mul(ethers.BigNumber.from(amount));
        tx = await cqtFaucetContract.connect(cqtOwner).faucet(receiverAddress, scaledAmount);
        console.log(await tx.wait());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
