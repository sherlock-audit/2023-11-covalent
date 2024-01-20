const hre = require('hardhat');

const NAME = 'CovalentQueryTokenFaucet';
const SYMBOL = 'CQT';
const MAX_SUPPLY = BigInt(1000000000000000000000000000);

async function deploy() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const CQTFaucet = await hre.ethers.getContractFactory('CovalentQueryTokenFaucet', deployer);
  const cqtFaucet = await CQTFaucet.deploy(NAME, SYMBOL, MAX_SUPPLY);
  await cqtFaucet.deployed();

  console.log('cqtFaucet deployed to:', cqtFaucet.address);
}

async function main() {
  await hre.run('compile');
  await deploy();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
