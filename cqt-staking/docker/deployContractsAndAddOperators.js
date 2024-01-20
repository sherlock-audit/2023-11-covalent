const erc20abi = require('./erc20.json');
const { ethers } = require('hardhat');
const hre = require('hardhat');
const {
  CQT_ETH_MAINNET,
  OWNER,
  WHALE,
  TOKEN_HOLDERS_ADDRESSES,
  BSP_OPERATORS,
  BSP_OPERATORS_TEST_PR_KEYS,
  BRP_OPERATORS,
  BRP_OPERATORS_TEST_PR_KEYS,
  VALIDATORS,
  VALIDATORS_TEST_PR_KEYS,
  EXTRA_ACCOUNTS,
  EXTRA_ACCOUNTS_TEST_PR_KEYS
} = require('./accountsAndAddresses.js');


const oneToken = ethers.BigNumber.from('1000000000000000000');

const impersonate = async (address) =>
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  })

const impersonateAll = async () => {
  let ALL = [OWNER, WHALE, ...TOKEN_HOLDERS_ADDRESSES, ...BSP_OPERATORS, ...BRP_OPERATORS, ...VALIDATORS, ...EXTRA_ACCOUNTS]
  for (let i = 0; i < ALL.length; i++)
    await impersonate(ALL[i])
}

const giveEth = async (amount, holders) => {
  let giver = await ethers.getSigner(WHALE);
  for (let i = 0; i < holders.length; i++) {
    await giver.sendTransaction({
      to: holders[i].address,
      value: ethers.utils.parseEther(amount),
    });
  }
}
const getAccount = async (address) => await ethers.getSigner(address);

const getAccounts = async (addresses) => {
  let accounts = []
  for (let i = 0; i < addresses.length; i++) {
    accounts.push(await getAccount(addresses[i]))
  }
  return accounts
}

const getOwner = async () => await getAccount(OWNER);

const getCqtContract = async () => new ethers.Contract(CQT_ETH_MAINNET, erc20abi, await getOwner());

const giveCQT = async (amount, to) => {
  const cqtContract = await getCqtContract();
  for (let i = 0; i < TOKEN_HOLDERS_ADDRESSES.length; i++) {
    let holderAddress = TOKEN_HOLDERS_ADDRESSES[i];
    let balance = await cqtContract.balanceOf(holderAddress)
    if (balance.gte(amount)) {
      let holder = await getAccount(holderAddress)
      await cqtContract.connect(holder).approve(to, amount);
      await cqtContract.connect(holder).transfer(to, amount);
      return
    }
  }
}


const deployUpgradeableContract = async (contractName, owner, params) => {
  await impersonateAll()
  const factory = await ethers.getContractFactory(contractName, owner)
  const contract = await upgrades.deployProxy(factory, params, { initializer: 'initialize' })
  return await contract.deployed()
}

const deployStakingWithDefaultParams = async () => await deployStaking([CQT_ETH_MAINNET, 5, 10, 2, oneToken.mul(100000)])

const deployStaking = async (params) => await deployUpgradeableContract('OperationalStaking', await getOwner(), params)

const deposit = async (contract, amount) => {
  const cqtContract = await getCqtContract()
  await cqtContract.approve(contract.address, amount)
  await contract.depositRewardTokens(amount)
}


async function main() {

  await impersonateAll()
  const owner = await getOwner()
  await giveEth('10.0', [owner])
  await giveCQT(oneToken.mul(1000000), owner.address)

  const bsStaking = await deployStakingWithDefaultParams()
  const brStaking = await deployStakingWithDefaultParams()

  const bsProofChain = await deployUpgradeableContract('BlockSpecimenProofChain', owner, [owner.address, bsStaking.address])
  const brProofChain = await deployUpgradeableContract('BlockResultProofChain', owner, [owner.address, brStaking.address])

  await bsStaking.connect(owner).setStakingManagerAddress(bsProofChain.address)
  await deposit(cqtContract, bsStaking, oneToken.mul(1000000))

  await brStaking.connect(owner).setStakingManagerAddress(brProofChain.address)
  await deposit(cqtContract, brStaking, oneToken.mul(1000000))

  // await bsProofChain.connect(owner).setBSPRequiredStake(oneToken)
  await bsProofChain.connect(owner).setBlockSpecimenReward(oneToken.div(100000000))

  // await brProofChain.connect(owner).setBRPRequiredStake(oneToken)
  await brProofChain.connect(owner).setBlockResultReward(oneToken.div(10000000))

  await bsProofChain.connect(owner).setQuorumThreshold(oneToken.div(2))
  await bsProofChain.connect(owner).setChainSyncData(1, 1000000, 1000000, 1)
  await bsProofChain.connect(owner).setSecondsPerBlock(1)
  await bsProofChain.connect(owner).setMaxSubmissionsPerBlockHeight(1, 3)
  await bsProofChain.connect(owner).setNthBlock(1, 1)
  await bsProofChain.connect(owner).setBlockHeightSubmissionsThreshold(1, 100000000)

  await brProofChain.connect(owner).setQuorumThreshold(oneToken.div(2))
  await brProofChain.connect(owner).setChainSyncData(1, 1000000, 1000000, 1)
  await brProofChain.connect(owner).setSecondsPerBlock(1)
  await brProofChain.connect(owner).setMaxSubmissionsPerBlockHeight(1, 3)
  await brProofChain.connect(owner).setNthBlock(1, 1)
  await brProofChain.connect(owner).setBlockHeightSubmissionsThreshold(1, 100000000)

  const cqtContract = await getCqtContract()

  console.log('Deploying contracts with the account:', owner.address)
  console.log('Account balance:', (await owner.getBalance()).toString())
  console.log('BlockSpecimen OperationalStaking deployed to:', bsStaking.address)
  console.log('BlockResult OperationalStaking deployed to:', brStaking.address)
  console.log('BlockSpecimen ProofChain deployed to:', bsProofChain.address)
  console.log('BlockResult ProofChain deployed to:', brProofChain.address)
  console.log('CQT contract address:', cqtContract.address)

  console.log("Setting up block specimen producers: ")

  commissionRate = BigInt(10 ** 17)
  stakeAmount = oneToken.mul(150)

  for (let validatorId = 0; validatorId < VALIDATORS.length; validatorId++) {

    let validator = await getAccount(VALIDATORS[validatorId])
    let bsp_operator = await getAccount(BSP_OPERATORS[validatorId])
    let brp_operator = await getAccount(BRP_OPERATORS[validatorId])

    await bsProofChain.connect(owner).addValidator(validator.address, oneToken.div(10))
    await bsProofChain.connect(owner).addBSPOperator(bsp_operator.address, validatorId)
    await giveCQT(oneToken.mul(1000), validator.address)
    await cqtContract.connect(validator).approve(bsStaking.address, oneToken.mul(1000))
    await bsStaking.connect(validator).stake(validatorId, oneToken.mul(1000))
    await bsProofChain.connect(validator).enableBSPOperator(bsp_operator.address)


    await brProofChain.connect(owner).addValidator(validator.address, oneToken.div(10))
    await brProofChain.connect(owner).addBRPOperator(brp_operator.address, validatorId)
    await giveCQT(oneToken.mul(1000), validator.address)
    await cqtContract.connect(validator).approve(brStaking.address, oneToken.mul(1000))
    await brStaking.connect(validator).stake(validatorId, oneToken.mul(1000))
    await brProofChain.connect(validator).enableBRPOperator(brp_operator.address)

    console.log()
    console.log()
    console.log("Added validator ", validatorId, " with the address: ", VALIDATORS[validatorId])
    console.log("With the private key: ", VALIDATORS_TEST_PR_KEYS[validatorId])
    console.log()
    console.log("With the following operators:")
    console.log()
    console.log("Block specimen producer: ", bsp_operator.address)
    console.log("With the private key: ", BSP_OPERATORS_TEST_PR_KEYS[validatorId])
    console.log()
    console.log("Block result producer: ", brp_operator.address)
    console.log("With the private key: ", BRP_OPERATORS_TEST_PR_KEYS[validatorId])
    console.log()
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
