const { ethers } = require('hardhat');
const {
    confirmInputsWithProofChain
} = require('./contractPrompt.js');


const DEFAULT_PROOFCHAIN_ADDRESS = "0x4f2E285227D43D9eB52799D0A28299540452446E";

const DEFAULT_VALUES = [1];
const VALUE_NAMES = ["chain id"];


async function main() {
    const [owner] = await ethers.getSigners();
    let result = await confirmInputsWithProofChain(
        owner,
        "Getting ProofChain metadata",
        DEFAULT_PROOFCHAIN_ADDRESS,
        VALUE_NAMES,
        DEFAULT_VALUES
    );
    if (result.confirmed) {
        const [chainId] = result.values
        console.log(await result.proofChain.getMetadata());
        console.log(await result.proofChain.getChainData(chainId));
        console.log(await result.proofChain.getBSPRoleData());
        console.log(await result.proofChain.getAllOperators());
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });