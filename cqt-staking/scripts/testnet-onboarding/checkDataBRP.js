const { ethers } = require("hardhat");
const fs = require("fs");
const csv = require("csv-parser");

const STAKING_ABI = require("../../generated-abis/ugly/OperationalStaking.json");
const BRP_PROOFCHAIN_ABI = require("../../generated-abis/ugly/BlockResultProofChain.json");
const cqtFaucetAbi = require("../../generated-abis/ugly/CovalentQueryTokenFaucet.json");

const BRP_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";
const BRP_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";
const cqt_address = "0xBE4C130aaFf02Ee7c723351b7D8C2B6da1D22ebd";

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
    const brpStaking = await new ethers.Contract(
        BRP_STAKING_ADDRESS,
        STAKING_ABI,
        signer
    );
    const brpProofChain = await new ethers.Contract(
        BRP_PROOFCHAIN_ADDRESS,
        BRP_PROOFCHAIN_ABI,
        signer
    );

    let data = await readCSV(
        "./scripts/testnet-onboarding/testnet_operators.csv"
    );
    console.log("Staking metadata: ")
    console.log(await brpStaking.getMetadata())

    console.log("ProofChain metadata: ")
    console.log(await brpProofChain.getMetadata());
    console.log(await brpProofChain.getChainData(1));
    console.log(await brpProofChain.getBRPRoleData());

    const existingValidatorAddresses = (
        await brpStaking.getAllValidatorsMetadata()
    ).addresses;

    let validatorAddressToIdMapping = {};

    existingValidatorAddresses.map((addr, index) => {
        validatorAddressToIdMapping[addr] = index;
    });

    let allEnabledOperators = new Set(
        (await brpProofChain.getAllOperators())._brps
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
        console.log(await brpStaking.getValidatorMetadata(id));
        console.log("ProofChain enabled/disabled operators:");
        let brps = await brpProofChain.getOperators(id);
        console.log(brps);
        console.log("Enabled operators: ");
        for (let j = 0; j < brps.length; j++) {
            const brp = brps[j];
            if (allEnabledOperators.has(brp)) console.log(brp);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });