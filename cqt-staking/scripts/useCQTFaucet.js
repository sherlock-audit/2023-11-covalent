const { ethers } = require('hardhat');
const {
    confirmInputs
} = require('./contractPrompt.js');
const {
    sleep
} = require('../test/fixtures.js');

const oneToken = ethers.BigNumber.from('1000000000000000000');

const cqtFaucetAbi = require('../generated-abis/ugly/CovalentQueryTokenFaucet.json');
const RECIPIENT = "";
const AMOUNT = 0;
const DEFAULT_CQT_ADDRESS = '';

const DEFAULT_VALUES = [RECIPIENT, AMOUNT, DEFAULT_CQT_ADDRESS];
const VALUE_NAMES = ["recipient address", "amount to send, unscaled (if you enter 1 it will scale to 10^18)", "CQT Faucet Address"];


async function main() {
    const [signer] = await ethers.getSigners();
    console.log(signer.address);
    let result = await confirmInputs(
        "Sending tokens using CQT Faucet",
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [recipient, amount, cqt_address] = result.values;

        const cqtFaucetContract = await new ethers.Contract(cqt_address, cqtFaucetAbi, signer);

        let scaledAmount = oneToken.mul(amount);
        await cqtFaucetContract.connect(signer).faucet(recipient, scaledAmount);
        await sleep(20000);
        newBalance = await cqtFaucetContract.connect(signer).balanceOf(recipient);
        console.log('CQT balance: ', newBalance);
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });