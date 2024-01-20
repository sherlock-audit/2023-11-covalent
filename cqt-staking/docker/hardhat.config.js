require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');


task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

module.exports = {
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
        },
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
    defaultNetwork: 'hardhat',
    networks: {
        test: {
            url: 'http://hardhat-node:8545/',
        }
    },
};