const { ethers } = require("hardhat");
const fs = require("fs");
const csv = require("csv-parser");

const STAKING_ABI = require("../../generated-abis/ugly/OperationalStaking.json");
const BSP_PROOFCHAIN_ABI = require("../../generated-abis/ugly/BlockSpecimenProofChain.json");
const cqtFaucetAbi = require("../../generated-abis/ugly/CovalentQueryTokenFaucet.json");

const BSP_PROOFCHAIN_ADDRESS = "0x4f2E285227D43D9eB52799D0A28299540452446E";
const BSP_STAKING_ADDRESS = "0x8eBbA081291B908096D19f6614Df041C95fc4469";
const cqt_address = "0x5130CA61Bf02618548dFC3FdeF50B50B36b11f2b";

function readCSV(filename) {
    return new Promise((resolve, reject) => {
        let results = [];
        fs.createReadStream(filename)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
}

async function main() {
    const [signer] = await ethers.getSigners();
    const cqtFaucetContract = await new ethers.Contract(
        cqt_address,
        cqtFaucetAbi,
        signer
    );
    const bspStaking = await new ethers.Contract(
        BSP_STAKING_ADDRESS,
        STAKING_ABI,
        signer
    );
    const bspProofchain = await new ethers.Contract(
        BSP_PROOFCHAIN_ADDRESS,
        BSP_PROOFCHAIN_ABI,
        signer
    );

    // let data = await readCSV(
    //     "./scripts/testnet-onboarding/testnet_operators.csv"
    // );
    console.log("Staking metadata: ")
    console.log(await bspStaking.getMetadata())

    console.log("ProofChain metadata: ")
    console.log(await bspProofchain.getMetadata());
    console.log(await bspProofchain.getChainData(1));
    console.log(await bspProofchain.getBSPRoleData());

    const existingValidatorAddresses = (
        await bspStaking.getAllValidatorsMetadata()
    ).addresses;

    let validatorAddressToIdMapping = {};

    existingValidatorAddresses.map((addr, index) => {
        validatorAddressToIdMapping[addr] = index;
    });

    let allEnabledOperators = new Set(
        (await bspProofchain.getAllOperators())._bsps
    );

    console.log("");
    for (let index = 0; index < existingValidatorAddresses.length; index++) {
        const validatorAddress = existingValidatorAddresses[index];

        let balance = await cqtFaucetContract.connect(signer).balanceOf(validatorAddress);
        let id = validatorAddressToIdMapping[validatorAddress];

        console.log()
        console.log()
        console.log("Validator: ", validatorAddress);
        console.log("Id: ", id);
        console.log("CQT balance: ", balance);
        console.log("Staking data:");
        console.log(await bspStaking.getValidatorMetadata(id));
        console.log("ProofChain enabled/disabled operators:");
        let bsps = await bspProofchain.getOperators(id);
        console.log(bsps);
        console.log("Enabled operators: ");
        for (let j = 0; j < bsps.length; j++) {
            const bsp = bsps[j];
            if (allEnabledOperators.has(bsp)) console.log(bsp);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });