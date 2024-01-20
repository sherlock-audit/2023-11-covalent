const { ethers } = require("hardhat");
const createKeccakHash = require("keccak");
const hre = require("hardhat");
const { OWNER, BSP_OPERATORS } = require("./accountsAndAddresses.js");
const proofChainAbi = require("./BlockSpecimenProofChain.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STAKING_ADDRESS = "0xfdF85083AD86Fc0846c7812Fd39F5b0E1e74D321";
const BSP_PROOFCHAIN_ADDRESS = "0xce44d283b806C62698285D83c2Ca3F1e42Eb7112";
const BRP_PROOFCHAIN_ADDRESS = "0x3402ce1e416e082ed3Ba3d9dcba10353F3b64499";
const CQT_ADDRESS = "0xD417144312DbF50465b1C641d016962017Ef6240";

const mineBlocks = async (n) => {
  for (let i = 0; i < n; i++) await hre.network.provider.send("evm_mine");
};

const getAccount = async (address) => await ethers.getSigner(address);
const getAccounts = async (addresses) => {
  let accounts = [];
  for (let i = 0; i < addresses.length; i++) {
    accounts.push(await getAccount(addresses[i]));
  }
  return accounts;
};

const impersonate = async (address) =>
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
const impersonateAll = async () => {
  let ALL = [OWNER, ...BSP_OPERATORS];
  for (let i = 0; i < ALL.length; i++) await impersonate(ALL[i]);
};

const getHash = (str) =>
  "0x" + createKeccakHash("keccak256").update(str).digest("hex");

const logSubmission = (
  operator,
  chainId,
  blockHeight,
  blockHash,
  specimenHash,
  storageURL
) => {
  console.log();
  console.log("Operator", operator, "submitted block specimen proof:");
  console.log("chain id:", chainId);
  console.log("block height:", blockHeight);
  console.log("block hash:", blockHash);
  console.log("specimen hash:", specimenHash);
  console.log("storage url:", storageURL);
  console.log();
};

const SESSION_CLOSED_ERROR = "Session submissions have closed";
const OPERATOR_ALREADY_SUBMITTED_ERROR =
  "Operator already submitted for the provided block hash";

async function main() {
  await impersonateAll();
  const owner = await getAccount(OWNER);
  const proofChain = new ethers.Contract(
    BSP_PROOFCHAIN_ADDRESS,
    proofChainAbi,
    owner
  );
  await proofChain.connect(owner).setBlockSpecimenSessionDuration(5);

  let operators = await getAccounts(BSP_OPERATORS);
  // let brpOperators = await getAccounts(BRP_OPERATORS);

  blockHeight = 0;
  const OPERATORS_N = 3;

  let storageURL = "storage.url";
  let chainId = 1;

  while (true) {
    let blockHash = getHash("a" + blockHeight);
    let specimenHash = getHash("specimenHash" + blockHeight);

    try {
      for (let i = 0; i < OPERATORS_N; i++) {
        res = await proofChain
          .connect(operators[i])
          .submitBlockSpecimenProof(
            chainId,
            blockHeight,
            blockHash,
            specimenHash,
            storageURL
          );

        // await proofChain.connect(brpOperators[i])
        //   .submitBlockResultProof(
        //     chainId,
        //     blockHeight,
        //     blockHash,
        //     specimenHash,
        //     storageURL
        //   );
        logSubmission(
          operators[i].address,
          chainId,
          blockHeight,
          blockHash,
          specimenHash,
          storageURL
        );
        console.log();
        await sleep(3000);
      }

      await mineBlocks(3);
      await sleep(3000);

      await proofChain
        .connect(owner)
        .finalizeAndRewardSpecimenSession(chainId, blockHeight);

      await sleep(10000);
    } catch (error) {
      if (
        error.toString().includes(SESSION_CLOSED_ERROR) ||
        error.toString().includes(OPERATOR_ALREADY_SUBMITTED_ERROR)
      ) {
        console.log(
          "Already submitted for the block height",
          blockHeight,
          ". Skipping... "
        );
      } else {
        console.log(error);
        exit(1);
      }
    }
    blockHeight++;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
