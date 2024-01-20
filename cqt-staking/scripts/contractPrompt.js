const { getCQTContractOnCurrentNetwork,
    getStakingContractOnCurrentNetwork,
    getProofChainContractOnCurrentNetwork,
    getProofChainContract,
    getStakingContract,
    getCQTContractFromAddress
} = require('../test/fixtures.js');
const hre = require('hardhat');
var prompt = require('prompt');

const askUntilSuccess = async (property, name) => {
    let success = false;
    while (!success) {
        const result = await prompt.get(property);
        if (result[name] == 'y' || result[name] == 'n')
            return result[name];
        console.log("Must respond y or n");
    }
};

const getContract = async (signer, defaultAddress, contractName, getContractFunction, getContractOnCurrentNetworkFunction) => {
    const networkName = hre.network.name;
    await prompt.start();

    let message = "Use default contract " + contractName + " for the network " + networkName + "? (y/n):";

    var property = {
        name: 'useNetworkDefault',
        message: message,
        validator: /y*|n?/,
        warning: 'Must respond y or n',
        default: 'y'
    };

    useNetworkDefault = await askUntilSuccess(property, "useNetworkDefault");
    if (useNetworkDefault == "y") {
        console.log();
        return await getContractOnCurrentNetworkFunction(signer);
    }


    property = {
        name: 'useFileDefaultAddress',
        message: "Use file default contract " + contractName + " address" + "? (y/n):",
        validator: /y*|n?/,
        warning: 'Must respond y or n',
        default: 'y'
    };
    const useFileDefaultAddress = await askUntilSuccess(property, "useFileDefaultAddress");
    if (useFileDefaultAddress == "y") {
        console.log();
        return await getContractFunction(signer, defaultAddress);
    }

    property = {
        name: 'customAddress',
        message: "Custom " + contractName + " contract address: ",
        warning: 'Must respond be contract address',
    };

    const { customAddress } = await prompt.get(property);
    console.log();
    return getContractFunction(signer, customAddress);
};

const getStakingContractFromPrompt = async (signer, defaultAddress) => {
    return await getContract(signer, defaultAddress, "Operational Staking", getStakingContract, getStakingContractOnCurrentNetwork);
};

const getProofChainContractFromPrompt = async (signer, defaultAddress) => {
    return await getContract(signer, defaultAddress, "BlockSpecimenProofChain", getProofChainContract, getProofChainContractOnCurrentNetwork);
};

const getCQTContractFromPrompt = async (signer, defaultAddress) => {
    return await getContract(signer, defaultAddress, "CQT ERC-20", getCQTContractFromAddress, getCQTContractOnCurrentNetwork);
};

const getInput = async (valueName) => {
    var property = {
        name: valueName,
        message: valueName
    };
    const result = await prompt.get(property);
    return result[valueName];
};

const getInputs = async (valueNames, defaultValues) => {
    let message = "Use default values for " + valueNames.toString() + " ? (y/n):";
    var property = {
        name: 'useDefaults',
        message: message,
        validator: /y*|n?/,
        warning: 'Must respond y or n',
        default: 'y'
    };

    useDefaults = await askUntilSuccess(property, "useDefaults");
    console.log();
    if (useDefaults == "y")
        return defaultValues;
    else {
        let resultArr = [];
        for (let i = 0; i < valueNames.length; i++) {
            resultArr.push(await getInput(valueNames[i]));
        }
        console.log();
        return resultArr;
    }
};

const confirmTx = async (txName, valueNames, values) => {

    let message = "Transaction data for " + txName + ": ";
    console.log(message);

    for (let i = 0; i < valueNames.length; i++) {
        console.log(valueNames[i] + " - " + values[i]);
    }

    var property = {
        name: 'confirm',
        message: "Confirm (y/n):",
        validator: /y*|n?/,
        warning: 'Must respond y or n',
        default: 'y'
    };
    let confirm = await askUntilSuccess(property, "confirm");
    console.log();
    if (confirm == "y")
        return true;
    else
        return false;

};

const confirmInputsWithProofChain = async (signer, txName, defaultProofChainAddress, valueNames, defaultValues) => {
    const proofChain = await getProofChainContractFromPrompt(signer, defaultProofChainAddress);
    const values = await getInputs(valueNames, defaultValues);
    let confirmed = await confirmTx(txName, ["ProofChain Address", ...valueNames], [proofChain.address, ...values]);
    return {
        confirmed, values, proofChain
    };
};

const confirmInputsWithStaking = async (signer, txName, defaultStakingAddress, valueNames, defaultValues) => {
    const staking = await getStakingContractFromPrompt(signer, defaultStakingAddress);
    const values = await getInputs(valueNames, defaultValues);
    let confirmed = await confirmTx(txName, ["Staking Address", ...valueNames], [staking.address, ...values]);
    return {
        confirmed, values, staking
    };
};

const confirmInputsWithStakingAndCQT = async (signer, txName, defaultStakingAddress, defaultCQTAddress, valueNames, defaultValues) => {
    const staking = await getStakingContractFromPrompt(signer, defaultStakingAddress);
    const cqt = await getCQTContractFromPrompt(signer, defaultCQTAddress);
    const values = await getInputs(valueNames, defaultValues);
    let confirmed = await confirmTx(txName, ["Staking Address", ...valueNames], [staking.address, ...values]);
    return {
        confirmed, values, staking, cqt
    };
};

const confirmInputsWithProofChainAndStaking = async (signer, txName, defaultStakingAddress, defaultProofChainAddress, valueNames, defaultValues) => {
    const staking = await getStakingContractFromPrompt(signer, defaultStakingAddress);
    const proofChain = await getProofChainContractFromPrompt(signer, defaultProofChainAddress);

    const values = await getInputs(valueNames, defaultValues);
    let confirmed = await confirmTx(txName, ["Staking Address", "ProofChain Address", ...valueNames], [staking.address, proofChain.address, ...values]);
    return {
        confirmed, values, proofChain, staking
    };
};

const confirmInputsWithCQT = async (signer, txName, defaultCQTAddress, valueNames, defaultValues) => {
    const values = await getInputs(valueNames, defaultValues);
    const cqt = await getCQTContractFromPrompt(signer, defaultCQTAddress);
    let confirmed = await confirmTx(txName, valueNames, values);
    return {
        confirmed, values, cqt
    };
};

const confirmInputs = async (txName, valueNames, defaultValues) => {
    const values = await getInputs(valueNames, defaultValues);
    let confirmed = await confirmTx(txName, valueNames, values);
    return {
        confirmed, values
    };
};


exports.confirmInputsWithProofChain = confirmInputsWithProofChain;
exports.confirmInputsWithProofChainAndStaking = confirmInputsWithProofChainAndStaking;
exports.confirmInputsWithStaking = confirmInputsWithStaking;
exports.confirmInputs = confirmInputs;
exports.confirmInputsWithCQT = confirmInputsWithCQT;
exports.confirmInputsWithStakingAndCQT = confirmInputsWithStakingAndCQT;

exports.confirmTx = confirmTx;
exports.getInputs = getInputs;
exports.getStakingContractFromPrompt = getStakingContractFromPrompt;
exports.getProofChainContractFromPrompt = getProofChainContractFromPrompt;
exports.getCQTContractFromPrompt = getCQTContractFromPrompt;
