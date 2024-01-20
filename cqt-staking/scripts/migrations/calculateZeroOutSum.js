

const { ethers } = require('hardhat');
const axios = require('axios');
const CQT_ABI = require('../../abis/erc20.json');

const COVALENT_API_KEY = process.env.COVALENT_API_KEY;
const MOONBASE_ALPHA_CHAIN_ID = 1287;
const STAKING_ADDRESS = process.env.MOONBEAM_ALPHA_STAKING_ADDRESS;
const TOPIC_HASH = "0x2271025ead37498adb64f5677e2ec0f1946f7634fb8935b65ba93ac894c3c1da";
const START_BLOCK = 3210777;
const CHAIN_ID = MOONBASE_ALPHA_CHAIN_ID;

const RECOVERY_WALLET = "0xC08B340A3D77Ca51A2139676Cc9721bBC2C386a9"

const CQT_ADDRESS = process.env.MOONBEAM_ALPHA_CQT_ADDRESS

async function getCQTContractFromAddress(signer, address) {
    return new ethers.Contract(address, CQT_ABI, signer);
  }

const getSum = async () => {
    let URL = "https://api.covalenthq.com/v1/" + CHAIN_ID + "/events/topics/" + TOPIC_HASH + "/?&starting-block=" + START_BLOCK + "&ending-block=latest&sender-address=" + STAKING_ADDRESS + "&key=" + COVALENT_API_KEY;
    console.log(URL);
    console.log()
    return await axios.get(URL)
        .then(res => {
            let amounts = res.data.data.items.map(it => {
                return ethers.BigNumber.from(it.raw_log_topics[1]);
            }
            );
            return amounts.reduce((partialSum, a) => a.add(partialSum), 0);
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
};



async function main() {
    const [owner] = await ethers.getSigners();

    const cqtContract = await getCQTContractFromAddress(owner, CQT_ADDRESS)

    const balance = await cqtContract.balanceOf(RECOVERY_WALLET)

    const sum = await getSum();
    console.log("BURNT:")
    console.log(sum);

    console.log("BALANCE:")
    console.log(balance)

    console.log("TO RECOVER:")
    const toRecover = balance.sub(sum)
    console.log(toRecover)

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });