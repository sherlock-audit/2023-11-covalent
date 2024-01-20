const { ethers } = require("hardhat");
const { oneToken, sleep } = require("../../test/fixtures.js");
const fs = require("fs");
const csv = require("csv-parser");

const STAKING_ABI = require("../../generated-abis/ugly/OperationalStaking.json");
const BRP_PROOFCHAIN_ABI = require("../../generated-abis/ugly/BlockResultProofChain.json");
const cqtFaucetAbi = require("../../generated-abis/ugly/CovalentQueryTokenFaucet.json");

const onePercent = ethers.BigNumber.from("10000000000000000");

const BRP_PROOFCHAIN_ADDRESS = "0x254E3FA072324fa202577F24147066359947bC23";
const BRP_STAKING_ADDRESS = "0x186BCAB20E7364D43e69AF22ba21f4d8536bcF14";
const cqt_address = "0xBE4C130aaFf02Ee7c723351b7D8C2B6da1D22ebd";
const minCQTStakedRequired = oneToken.mul("35000");

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
        "./scripts/testnet-onboarding/mainnet_operators.csv"
    );
    console.log("Loaded csv data:")
    console.log(data);

    const existingValidatorAddresses = new Set(
        (await brpStaking.getAllValidatorsMetadata()).addresses
    );

    console.log(
        "validators already added to the staking contract:",
        existingValidatorAddresses
    );

    console.log("adding missing validators");
    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const validatorAddress = row["validator_address"];
        if (existingValidatorAddresses.has(validatorAddress)) {
            console.log("skipping ", validatorAddress);
        } else {
            const commissionRate = row["commission_rate"];
            console.log(
                "adding " + validatorAddress + " with commission rate " + commissionRate
            );
            const commissionRateScaled = onePercent.mul(commissionRate);
            await brpProofChain
                .connect(signer)
                .addValidator(validatorAddress, commissionRateScaled);
            await sleep(30000)
                // await brpStaking
                //     .connect(signer)
                //     .addValidator(validatorAddress, commissionRateScaled);
                // console.log("emitting tokens to ", validatorAddress);
                // await cqtFaucetContract
                //     .connect(signer)
                //     .faucet(validatorAddress, minCQTStakedRequired);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });