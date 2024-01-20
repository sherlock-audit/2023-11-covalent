const { ethers } = require("hardhat");
const fs = require("fs");
const csv = require("csv-parser");

const STAKING_ABI = require("../../generated-abis/ugly/OperationalStaking.json");
const BRP_PROOFCHAIN_ABI = require("../../generated-abis/ugly/BlockResultProofChain.json");
const { sleep } = require("../../test/fixtures");

const BRP_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";
const BRP_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";

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
        "./scripts/testnet-onboarding/mainnet_operators.csv"
    );
    console.log(data);

    const existingValidatorAddresses = (
        await brpStaking.getAllValidatorsMetadata()
    ).addresses;



    let validatorAddressToIdMapping = {};

    existingValidatorAddresses.map((addr, index) => {
        validatorAddressToIdMapping[addr] = index;
    });

    console.log(validatorAddressToIdMapping);
    // await sleep(1000000)
    console.log("adding missing operators");
    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const validatorAddress = row["validator_address"];
        const operatorAddress = row["operator_address"];
        const validatorId = validatorAddressToIdMapping[validatorAddress];
        const alreadyAddedOperators = new Set(
            await brpProofChain.getOperators(validatorId)
        );
        const hasOperator = alreadyAddedOperators.has(operatorAddress);
        if (hasOperator) {
            console.log("skipping operator", operatorAddress + " validator id " + validatorId + " validator address " + validatorAddress);
            // await brpProofChain.connect(signer).removeBRPOperator(operatorAddress, { gasLimit: 1000000 });
            // await sleep(30000)
        } else {
            console.log("adding operator " + operatorAddress + " to validator id " + validatorId + " validator address " + validatorAddress);

            await brpProofChain
                .connect(signer)
                .addBRPOperator(operatorAddress, validatorId);
            await sleep(30000)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });