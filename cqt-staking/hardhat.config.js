const { networks } = require('./docker/hardhat.config');

require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-gas-reporter');
require('hardhat-abi-exporter');
require('solidity-coverage');
require('hardhat-contract-sizer');
require("@openzeppelin/hardhat-defender");
require("@nomiclabs/hardhat-etherscan");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async(taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

let bnetworks = {
    hardhat: {
        chainId: 1,
        forking: {
            url: process.env.ERIGON_NODE,
            blockNumber: 13182263,
        },
    },
    test: {
        url: 'http://0.0.0.0:8545/',
    },
    // sepolia: {
    //     url: process.env.SEPOLIA_NODE,
    //     accounts: [
    //         process.env.CQT_CONTRACT_OWNER,
    //         process.env.CONTRACTS_DEPLOYER,
    //         process.env.SC_MANAGER,
    //         process.env.V1,
    //         process.env.OP1_1,
    //         process.env.OP1_2,
    //         process.env.V2,
    //         process.env.OP2_1,
    //         process.env.V_BAK,
    //         process.env.V3
    //     ],
    // },
    // cqt: {
    //     url: process.env.CQT_NODE,
    //     accounts: [process.env.CQT_NETWORK_CONTRACT_OWNER],
    //     chainId: 1131378225,
    // },
    // moonbeamProd: {
    //     url: "https://1rpc.io/glmr",
    //     accounts: [process.env.MOONBEAM_PROD_PROOFCHAIN_GOVERNOR]
    // },
    // moonbeamTestContracts: {
    //     url: "https://rpc.api.moonbeam.network",
    //     accounts: [process.env.MOONBEAM_TEST_PROOFCHAIN_GOVERNOR]
    // },
    // moonbeamAlpha: {
    //     url: "https://moonbase-alpha.public.blastapi.io",
    //     gas: 5000000,
    //     gasPrice: "auto",
    //     accounts: [
    //         process.env.MOONBEAM_ALPHA_OWNER_PR,
    //         process.env.V1
    //         process.env.V2,
    //         process.env.V3,
    //         process.env.V4,
    //         process.env.V5,
    //         process.env.V6,
    //         process.env.V7,
    //         process.env.V8,
    //         process.env.V9,
    //         process.env.V10,
    //         process.env.V11,
    //         process.env.V12,
    //         process.env.V13,
    //         process.env.V14,
    //         process.env.V15,
    //         process.env.D1,
    //         process.env.D2,
    //         process.env.D3,
    //         process.env.D4,
    //         process.env.D5,
    //         process.env.D6,
    //         process.env.D7
    //     ],
    //     chainId: 1287,
    // }
};

// Remove Sepolia network if the TEST_ENV flag is set
if (process.env.TEST_ENV) {
    delete bnetworks.sepolia
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defender: {
        apiKey: process.env.DEFENDER_API_KEY,
        apiSecret: process.env.DEFENDER_SECRET_KEY,
    },
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1,
            },
        },
    },
    gasReporter: {
        currency: 'CHF',
        gasPrice: 21,
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
    mocha: {
        timeout: 100000,
    },
    abiExporter: [{
            path: './generated-abis/ugly',
            clear: true,
            flat: true,
            spacing: 2,
        },
        {
            path: './generated-abis/pretty',
            pretty: true,
        },
    ],
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
        only: [':ProofChain$'],
    },
    defaultNetwork: 'hardhat',
    networks: bnetworks,
    etherscan: {
        apiKey: {
            moonbeam: process.env.MOONBEAM_SCAN_API_KEY, // Moonbeam Moonscan API Key
            moonbaseAlpha: process.env.MOONBEAM_SCAN_API_KEY, // Moonbeam Moonscan API Key
            sepolia: process.env.ETHERSCAN_API_KEY
        }
    }
};
