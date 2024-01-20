const {deployMockContract} = require('@ethereum-waffle/mock-contract');

const erc20abi = require('../abis/erc20.json');
const createKeccakHash = require('keccak');
const { ethers } = require('hardhat');
const hre = require('hardhat');
const CQT_ABI = require('../abis/erc20.json');
const STAKING_ABI = require('../generated-abis/ugly/OperationalStaking.json');
const BSP_PROOFCHAIN_ABI = require('../generated-abis/ugly/BlockSpecimenProofChain.json');
const BRP_PROOFCHAIN_ABI = require("../generated-abis/ugly/BlockResultProofChain.json");
const oneToken = ethers.BigNumber.from('1000000000000000000');
const ETHEREUM_CQT_ADDRESS = process.env.ETHEREUM_CQT_ADDRESS;
const crypto = require("crypto");

const OWNER = '0x8D1f2eBFACCf1136dB76FDD1b86f1deDE2D23852';
const WHALE = '0x189B9cBd4AfF470aF2C0102f365FC1823d857965';

const GOVERNANCE_ROLE = '0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253ceb1';
const BLOCK_SPECIMEN_PRODUCER_ROLE = '0x98d0bb2de1c65f6d2cbc3401e3d5d5086bfe815cb57e521dafd0ebdbef6ee85c';
const BLOCK_RESULT_PRODUCER_ROLE = '0x77ae3b5d012484be69eeed881350adb3189b651fac6e88b31ddff30c833a8b7f';
const AUDITOR_ROLE = '0x59a1c48e5837ad7a7f3dcedcbe129bf3249ec4fbf651fd4f5e2600ead39fe2f5';

const VALIDATOR_ADDRESSES = [
    '0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2',
    '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
    '0xd6216fc19db775df9774a6e33526131da7d19a2c',
    '0xf050257f16a466f7d3926a38e830589ab539ee88',
    '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
    '0xd1669ac6044269b59fa12c5822439f609ca54f41',
    '0x0211f3cedbef3143223d3acf0e589747933e8527',
    '0xf6ffb51aef3b7aa106d2d878985a9bf1ca6e88fe',
    '0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2',
    '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b'
];

const OPERATOR_ADDRESSES = [
    '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    '0x61EDCDf5bb737ADffE5043706e7C5bb1f1a56eEA',
    '0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C',
    '0x0548f59fee79f8832c299e01dca5c76f034f558e',
    '0x189b9cbd4aff470af2c0102f365fc1823d857965',
    '0x9845e1909dca337944a0272f1f9f7249833d2d19',
    '0xb29380ffc20696729b7ab8d093fa1e2ec14dfe2b',
    '0xcdbf58a9a9b54a2c43800c50c7192946de858321',
    '0x19184ab45c40c2920b0e0e31413b9434abd243ed',
];

const DELEGATOR_ADDRESSES = [
    '0xb270FC573F9f9868ab11B52AE7119120f6a4471d',
    '0xa56B1B002814Ac493A6DAb5A72d30996B6A9Fe4d',
];

const TOKEN_HOLDERS_ADDRESSES = [
    '0x076924c052b7a3112bee8658a8c3e19d69361df2',
    '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
    '0xfb33ed64cea706a622f2dad79a687d8256413c27',
    '0x285b10c73de847ee35bcb5cd86f17d55ff936476',
    '0xff26ccf9058b9bd8facfb6a8876864fec193285d',
    '0xa2dcb52f5cf34a84a2ebfb7d937f7051ae4c697b',
    '0x9437806725631c0b209b6c0b5fd4198a77a57073',
    '0x0000006daea1723962647b7e189d311d757fb793',
    '0x0000006daea1723962647b7e189d311d757fb793',
    '0x267c9504cb5e570e4fb923be5fcdaa9460789441',
    '0xd6236f3de6850683b63a6ec02184284d91f245de',
    '0xfb9fad3de077894628cb8f78ae68e2d436b98190',
    '0x3bb9378a2a29279aa82c00131a6046aa0b5f6a79',
    '0xa1d8d972560c2f8144af871db508f0b0b10a3fbf',
];

const STAKING_MANAGER = '0xaaaaa351756104a0fecB3842B7334f42E1e4d042';

const getAccounts = async(n) => {
    let accounts = []
    for (let index = 0; index < n; index++) {
        var id = crypto.randomBytes(32).toString("hex");
        var privateKey = "0x" + id;
        // console.log("SAVE BUT DO NOT SHARE THIS:", privateKey);
        var wallet = new ethers.Wallet(privateKey);
        // console.log("Address: " + wallet.address);

        await giveEth('0.1', [wallet])
        accounts.push(await getSignerNoEth(wallet.address))

    }
    return accounts

};

const getSignerNoEth = async(address) => {
    await impersonate(address);
    const signer = await ethers.getSigner(address);
    await giveEth('1.0', [signer]);
    return signer;
};

const getSigner = async(address) => {
    await impersonate(address);
    const signer = await ethers.getSigner(address);
    await giveEth('1.0', [signer]);
    return signer;
};

const impersonate = async(address) =>
    await hre.network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [address],
    });

const impersonateAll = async() => {
    let ALL = [OWNER, WHALE, STAKING_MANAGER,...TOKEN_HOLDERS_ADDRESSES, ...VALIDATOR_ADDRESSES, ...OPERATOR_ADDRESSES, ...DELEGATOR_ADDRESSES];
    for (let i = 0; i < ALL.length; i++)
        await impersonate(ALL[i]);
};

const getTokenHolders = async() => {
    let holders = await getSigners(TOKEN_HOLDERS_ADDRESSES);
    await giveEth('10.0', holders);
    return holders;
};

const mineBlocks = async(n) => {
    for (let i = 0; i < n; i++)
        await hre.network.provider.send('evm_mine');
};

const giveEth = async(amount, holders) => {
    let giver = await ethers.getSigner(WHALE);
    for (let i = 0; i < holders.length; i++) {
        await giver.sendTransaction({
            to: holders[i].address,
            value: ethers.utils.parseEther(amount),
        });
    }
};

const getOwner = async() => {
    await impersonate(OWNER);
    return await ethers.getSigner(OWNER);
};

const getCqtContract = async() => new ethers.Contract(ETHEREUM_CQT_ADDRESS, erc20abi, await getOwner());

const getAll = async(opts={}) => {
    const validatorCoolDown = 180 * 6646; // ~ 6 months
    const delegatorCoolDown = 28 * 6646; // ~ 28 days
    return await getAllWithCoolDown(
        (opts.useRealCqtContract || false),
        delegatorCoolDown,
        validatorCoolDown,
        2,
        oneToken.mul(350000),
    );
};

const getAllWithCoolDown = async (
  useRealCqtContract,
  delegatorCoolDown,
  validatorCoolDown,
  maxCapM,
  maxStakeCap,
) => {
    const owner = await getOwner();
    const cqtContract = useRealCqtContract ? (await getCqtContract()) : (await deployMockCqtContract(owner));
    const contract = await deployStaking([cqtContract.address, delegatorCoolDown, validatorCoolDown, maxCapM, maxStakeCap]);
    await contract.connect(owner).setStakingManagerAddress(owner.address);
    const members = [
        await ethers.getSigner(VALIDATOR_ADDRESSES[0]),
        await ethers.getSigner(VALIDATOR_ADDRESSES[1]),
        await ethers.getSigner(DELEGATOR_ADDRESSES[0]),
        await ethers.getSigner(DELEGATOR_ADDRESSES[1]),
        await ethers.getSigner(VALIDATOR_ADDRESSES[2]),
        await ethers.getSigner(VALIDATOR_ADDRESSES[3])
    ];

    await giveEth('10.0', [owner, ...members]);
    return [owner, contract, cqtContract, ...members];
};

const getMetadata = async(contract) => await contract.getMetadata();
const getRewardsLocked = async(contract) => (await contract.getMetadata())._rewardPool;
const getCQTaddress = async(contract) => (await contract.getMetadata()).CQTaddress;
const getValidatorMinStakedRequired = async(opManager) => await opManager.getValidatorMinStakedRequired(0);
const getValidatorsN = async(contract) => (await contract.getMetadata())._validatorsN;
const getValidatorCoolDown = async(contract) => (await contract.getMetadata())._validatorCoolDown;
const getDelegatorCoolDown = async(contract) => (await contract.getMetadata())._delegatorCoolDown;

const addStakedValidator = async (id, contract, cqtContract, opManager, validator, cRate) => {
    await contract.connect(opManager).addValidator(validator.address, cRate);
    let minRequiredStakeAmount = await contract.connect(opManager).validatorEnableMinStake();
    if (minRequiredStakeAmount.gt(0)) {
        await stake(minRequiredStakeAmount, validator, cqtContract, contract, id);
    }
    await contract.connect(opManager).enableValidator(id);
};

const deployUpgradeableContract = async(contractName, owner, params) => {
    await impersonateAll();
    const factory = await ethers.getContractFactory(contractName, owner);
    const contract = await upgrades.deployProxy(factory, params, { initializer: 'initialize' });
    return await contract.deployed();
};

const deployStakingWithDefaultParams = async(cqtContract) => await deployStaking([cqtContract.address, 5, 10, 2, oneToken.mul(350000)]);
const deployStaking = async(params) => await deployUpgradeableContract('OperationalStaking', await getOwner(), params);

const deposit = async (cqtContract, contract, amount) => {
    await cqtContract.approve(contract.address, amount);
    await contract.depositRewardTokens(amount);
};

const giveCQT = async(amount, recipientAddress, cqtContract) => {
    const tokenHolder = await getSigner(TOKEN_HOLDERS_ADDRESSES[0]);
    await cqtContract.connect(tokenHolder).transfer(recipientAddress, amount);
};

const stake = async(amount, signer, cqtContract, contract, id) => {
    await cqtContract.connect(signer).approve(contract.address, amount);
    await contract.connect(signer).stake(id, amount);
};

const stakeForExpect = async (amount, signer, cqtContract, contract, id) => {
  await cqtContract.connect(signer).approve(contract.address, amount);
  return contract.connect(signer).stake(id, amount);
};

const setCoolDown = async (isValidator, contract, coolDown) => {
    if (isValidator) {
        await contract.connect(await getOwner()).setValidatorCoolDown(coolDown);
    } else {
        await contract.connect(await getOwner()).setDelegatorCoolDown(coolDown);
    }
};


const getSigners = async(addresses) => {
    let signers = [];
    for (i = 0; i < addresses.length; i++)
        signers.push(await ethers.getSigner(addresses[i]));
    return signers;
};

const getAllWithProofchain = async(opts={}) => {
    let proofChainContractName =
        (opts.withProofChain == 'BlockResult')
            ? 'BlockResultProofChain'
            : 'BlockSpecimenProofChain';

    const owner = await getOwner();
    const cqtContract = await deployMockCqtContract(owner);
    const staking = await deployStakingWithDefaultParams(cqtContract);
    const proofChain = await deployUpgradeableContract(proofChainContractName, owner, [owner.address, STAKING_MANAGER]);

    let validators = await getSigners(VALIDATOR_ADDRESSES);
    let operators = await getSigners(OPERATOR_ADDRESSES);
    let delegators = await getSigners(DELEGATOR_ADDRESSES);
    let stakingManager = await getSigner(STAKING_MANAGER);

    await proofChain.connect(owner).setNthBlock(1, 1);
    await staking.connect(owner).setStakingManagerAddress(stakingManager.address);

    await giveEth('1.0', [owner, stakingManager, ...validators, ...operators, ...delegators]);

    return [
        owner,
        staking,
        cqtContract,
        proofChain,
        validators,
        operators,
        delegators,
        stakingManager
    ];
};


const setupWithDefaultParameters = async(opts={}) => {
    const rewardPool = oneToken.mul(100000);
    const maxCapMultiplier = 10;
    const maxStakeLimit = oneToken.mul(350000);
    const bspStakeRequired = oneToken.mul(175000);
    const blockResultReward = oneToken.mul(1);
    const specimenQuorumThreshold = BigInt(10 ** 18); // 100%

    parameters = [
        rewardPool,
        maxCapMultiplier,
        maxStakeLimit,
        bspStakeRequired,
        blockResultReward,
        specimenQuorumThreshold,
    ];
    [
        owner,
        stakingContract,
        cqtContract,
        proofChain,
        validators,
        operators,
        delegators,
        stakingManager,
    ] = await getAllWithProofchain(opts);

    let proofChainSetRewardHandle =
        proofChain.setBlockResultReward
            ? 'setBlockResultReward'
            : 'setBlockSpecimenReward';

    await deposit(cqtContract, stakingContract, rewardPool);

    await stakingContract.connect(owner).setStakingManagerAddress(stakingManager.address);
    await stakingContract.connect(owner).setMaxCapMultiplier(maxCapMultiplier);
    await stakingContract.connect(owner).setValidatorMaxStake(maxStakeLimit);

    // await proofChain.connect(owner).setBSPRequiredStake(bspStakeRequired);
    await proofChain.connect(owner)[proofChainSetRewardHandle](blockResultReward);
    await proofChain.connect(owner).setQuorumThreshold(oneToken.div(2));

    await proofChain.connect(owner).setStakingManagerAddress(stakingManager.address);
    await proofChain.connect(owner).setChainSyncData(1, 1, 1, 1);
    await proofChain.connect(owner).setSecondsPerBlock(1);
    await proofChain.connect(owner).setMaxSubmissionsPerBlockHeight(1, 3);
    await proofChain.connect(owner).setNthBlock(1, 1);
    await proofChain.connect(owner).setBlockHeightSubmissionsThreshold(1, 100000000);

    return [
        [
            owner,
            stakingContract,
            cqtContract,
            proofChain,
            validators,
            operators,
            delegators,
            stakingManager,
        ], parameters
    ];
};


const setupDefaultOperators = async(opts={}) => {
    [contractsAndAccounts, parameters] = await setupWithDefaultParameters(opts);
    [
        owner,
        stakingContract,
        cqtContract,
        proofChain,
        validators,
        operators,
        delegators,
        stakingManager,
    ] = contractsAndAccounts;

    commissionRate = BigInt(10 ** 17);
    stakeAmount = oneToken.mul(150);

    await stakingContract.connect(owner).setValidatorEnableMinStake(0);

    let proofChainAddOperatorHandle =
        proofChain.addBRPOperator
            ? 'addBRPOperator'
            : 'addBSPOperator';

    for (let validatorId = 0; validatorId < validators.length; validatorId++) {
        validator = validators[validatorId];
        operator = operators[validatorId];

        await stakingContract.connect(stakingManager).addValidator(validator.address, commissionRate);
        await proofChain.connect(stakingManager).enableValidator(validatorId);

        await stake(stakeAmount, validator, cqtContract, stakingContract, validatorId);
        await proofChain.connect(owner)[proofChainAddOperatorHandle](operator.address, validatorId);
    }

    return [contractsAndAccounts, parameters];
};

const getHash = (str) => '0x' + createKeccakHash('keccak256').update(str).digest('hex');

const getProofChainAddressOnCurrentNetwork = () => {
    const networkName = hre.network.name;
    return networkName == "moonbeamTestContracts" ? process.env.MOONBEAM_TEST_PROOFCHAIN_ADDRESS :
        networkName == "moonbeamProdContracts" ? process.env.MOONBEAM_PROD_PROOFCHAIN_ADDRESS :
        networkName == "cqt" ? process.env.CQT_PROOFCHAIN_ADDRESS :
        networkName == "moonbeamAlpha" ? process.env.MOONBEAM_ALPHA_PROOFCHAIN_ADDRESS : "0";
};

const getStakingAddressOnCurrentNetwork = () => {
    const networkName = hre.network.name;
    return networkName == "moonbeamTestContracts" ? process.env.MOONBEAM_TEST_STAKING_ADDRESS :
        networkName == "moonbeamProdContracts" ? process.env.MOONBEAM_PROD_STAKING_ADDRESS :
        networkName == "cqt" ? process.env.CQT_STAKING_ADDRESS :
        networkName == "moonbeamAlpha" ? process.env.MOONBEAM_ALPHA_STAKING_ADDRESS : "0";
};

const getCQTAddressOnCurrentNetwork = () => {
    const networkName = hre.network.name;
    return networkName == "moonbeamTestContracts" ? process.env.MOONBEAM_CQT_ADDRESS :
        networkName == "moonbeamProd" ? process.env.MOONBEAM_CQT_ADDRESS :
        networkName == "cqt" ? process.env.CQT_CQT_ADDRESS :
        networkName == "moonbeamAlpha" ? process.env.MOONBEAM_ALPHA_CQT_ADDRESS : "0";
};

async function getProofChainContract(signer, address) {
    return new ethers.Contract(address, BSP_PROOFCHAIN_ABI, signer); // by default proofchain means bsp proofchain
}

async function getBspProofChainContract(signer, address) {
    return new ethers.Contract(address, BSP_PROOFCHAIN_ABI, signer);
}

async function getBrpProofChainContract(signer, address) {
    return new ethers.Contract(address, BRP_PROOFCHAIN_ABI, signer);
}

async function getStakingContract(signer, address) {
    return new ethers.Contract(address, STAKING_ABI, signer);
}

async function getCQTContractFromAddress(signer, address) {
    return new ethers.Contract(address, CQT_ABI, signer);
}

async function getProofChainContractOnCurrentNetwork(signer) {
    let address = getProofChainAddressOnCurrentNetwork();
    return getProofChainContract(signer, address);
}

async function getStakingContractOnCurrentNetwork(signer) {
    let address = getStakingAddressOnCurrentNetwork();
    return getStakingContract(signer, address);
}

async function getCQTContract(signer, address) {
    return new ethers.Contract(address, CQT_ABI, signer);
}

async function deployMockCqtContract(signer) {
  let cqtContract = await deployMockContract(signer, CQT_ABI);
  cqtContract.mock.totalSupply.returns(oneToken.mul(1_000_000_000_000_000));
  cqtContract.mock.balanceOf.returns(oneToken.mul(1_000_000_000));
  cqtContract.mock.approve.returns(true);
  cqtContract.mock.transfer.returns(true);
  cqtContract.mock.allowance.returns(oneToken.mul(1_000_000_000));
  cqtContract.mock.transferFrom.returns(true);
  return cqtContract;
}

async function getCQTFaucetContract(deployer) {
    const NAME = 'CovalentQueryTokenFaucet';
    const SYMBOL = 'CQT';
    const MAX_SUPPLY = BigInt(1000000000000000000000000000);

    console.log('Deploying CQT Faucet with the account:', deployer.address);
    // console.log('Account balance:', (await deployer.getBalance()).toString());

    const CQTFaucet = await hre.ethers.getContractFactory('CovalentQueryTokenFaucet', deployer);
    const cqtFaucet = await CQTFaucet.deploy(NAME, SYMBOL, MAX_SUPPLY);
    await cqtFaucet.deployed();
    return cqtFaucet;
}


async function getCQTContractOnCurrentNetwork(signer) {
    let address = getCQTAddressOnCurrentNetwork();
    return getCQTContract(signer, address);
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getDelegatorBalances(stakingContract, delegatorAddress) {

    const validatorN = (await stakingContract.getMetadata())._validatorsN;
    let sum = zero();
    let unstaked = zero();
    let rewards = zero();
    let staked = zero();
    for (var i = 0; i < validatorN; i++) {
        const delegatorData = await stakingContract.getDelegatorMetadata(delegatorAddress, i);
        for (var k = 0; k < delegatorData.unstakingAmounts.length; k++) {
            sum = sum.add(delegatorData.unstakingAmounts[k]);
            unstaked = unstakedRedeemable.add(delegatorData.unstakingAmounts[k]);
        }
        sum = sum.add(delegatorData.staked);
        sum = sum.add(delegatorData.rewards);
        sum = sum.add(delegatorData.commissionEarned);
        staked = staked.add(delegatorData.staked);
        rewards = rewards.add(delegatorData.rewards);
    }
    let row = [sum, rewards, unstaked];
    row = row.map(val => val.div(oneToken).toString());
    row = [delegatorAddress].concat(row);
    return { sum: sum, staked: staked, rewards: rewards, unstaked: unstaked };
}

const zero = () => ethers.BigNumber.from(0);

exports.stake = stake;
exports.stakeForExpect = stakeForExpect;
exports.deposit = deposit;
exports.getAll = getAll;
exports.getAllWithCoolDown = getAllWithCoolDown;
exports.mineBlocks = mineBlocks;
exports.getOwner = getOwner;
exports.getMetadata = getMetadata;
exports.getRewardsLocked = getRewardsLocked;
exports.getValidatorsN = getValidatorsN;
exports.getTokenHolders = getTokenHolders;
exports.getCQTaddress = getCQTaddress;
exports.getValidatorMinStakedRequired = getValidatorMinStakedRequired;
exports.getValidatorCoolDown = getValidatorCoolDown;
exports.getDelegatorCoolDown = getDelegatorCoolDown;
exports.deployStakingWithDefaultParams = deployStakingWithDefaultParams;
exports.deployStaking = deployStaking;
exports.impersonateAll = impersonateAll;
exports.impersonate = impersonate;
exports.addStakedValidator = addStakedValidator;
exports.getAllWithProofchain = getAllWithProofchain;
exports.setupWithDefaultParameters = setupWithDefaultParameters;
exports.setupDefaultOperators = setupDefaultOperators;
exports.getCqtContract = getCqtContract;
exports.giveEth = giveEth;
exports.getHash = getHash;
exports.getProofChainContract = getProofChainContract;
exports.getStakingContract = getStakingContract;
exports.getCQTContractFromAddress = getCQTContractFromAddress;
exports.getProofChainAddressOnCurrentNetwork = getProofChainAddressOnCurrentNetwork;
exports.getStakingAddressOnCurrentNetwork = getStakingAddressOnCurrentNetwork;
exports.getProofChainContractOnCurrentNetwork = getProofChainContractOnCurrentNetwork;
exports.getStakingContractOnCurrentNetwork = getStakingContractOnCurrentNetwork;
exports.getCQTContractOnCurrentNetwork = getCQTContractOnCurrentNetwork;
exports.getCQTAddressOnCurrentNetwork = getCQTAddressOnCurrentNetwork;
exports.getBspProofChainContract = getBspProofChainContract;
exports.getBrpProofChainContract = getBrpProofChainContract;
exports.sleep = sleep;
exports.zero = zero;
exports.getCQTFaucetContract = getCQTFaucetContract;
exports.getSigner = getSigner;
exports.giveCQT = giveCQT;
exports.zero = zero;
exports.getDelegatorBalances = getDelegatorBalances;
exports.getAccounts = getAccounts;
exports.deployMockCqtContract = deployMockCqtContract;
exports.setCoolDown = setCoolDown;

exports.oneToken = oneToken;
exports.OWNER = OWNER;
exports.VALIDATOR_1 = VALIDATOR_ADDRESSES[0];
exports.VALIDATOR_2 = VALIDATOR_ADDRESSES[1];
exports.VALIDATOR_3 = VALIDATOR_ADDRESSES[2];
exports.VALIDATOR_4 = VALIDATOR_ADDRESSES[3];
exports.OPERATOR_1 = OPERATOR_ADDRESSES[0];
exports.OPERATOR_2 = OPERATOR_ADDRESSES[2];
exports.OPERATOR_3 = OPERATOR_ADDRESSES[3];
exports.OPERATOR_4 = OPERATOR_ADDRESSES[4];
exports.DELEGATOR_1 = DELEGATOR_ADDRESSES[0];
exports.DELEGATOR_2 = DELEGATOR_ADDRESSES[1];
exports.CQT = ETHEREUM_CQT_ADDRESS;
exports.CQT_ETH_MAINNET = ETHEREUM_CQT_ADDRESS;
exports.GOVERNANCE_ROLE = GOVERNANCE_ROLE;
exports.AUDITOR_ROLE = AUDITOR_ROLE;
exports.BLOCK_SPECIMEN_PRODUCER_ROLE = BLOCK_SPECIMEN_PRODUCER_ROLE;
exports.BLOCK_RESULT_PRODUCER_ROLE = BLOCK_RESULT_PRODUCER_ROLE;
