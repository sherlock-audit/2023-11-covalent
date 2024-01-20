
const { ethers } = require('hardhat');
const {
    zero,
    sleep,
    oneToken
} = require('../../test/fixtures.js');
const { Client } = require('pg');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const axios = require('axios');
const STAKING_ABI = require('../../generated-abis/ugly/OperationalStaking.json');

const COVALENT_API_KEY = process.env.COVALENT_API_KEY;
const CHAIN_ID = 1284;
const STAKING_ADDRESS = process.env.MOONBEAM_PROD_STAKING_ADDRESS;
const abiCoder = ethers.utils.defaultAbiCoder;
const WOODSTOCK_2 = "0x1db596c09f5b37013b3cc263b9903d2474050f3f";


const getFirstStakeEventString = (delegatorAddress) => {
    // -- First event given delegator address: 128E6bBAa2d269A7D26a3E3AF13Ea86943A05C24
    delegatorAddress = delegatorAddress.slice(2);
    let stakingAddress = STAKING_ADDRESS.slice(2);
    return `
    WITH staking_events AS (SELECT block_signed_at                                 AS date,
                                extract_address(abi_field(data, 0))             AS delegator,
                                (cast(abi_field(data, 1) as numeric) / 10 ^ 18) AS value,
                                *
                            FROM chain_moonbeam_mainnet.block_log_events
                            WHERE sender = '\\x${stakingAddress}'
                            AND topics @>
                                ARRAY [('\\xc833924412a8727ace4d92945c637ad2d4b389e582bfd4a95cdee608eee9720a')::bytea]
                            AND abi_field(data, 0) =
                                ('\\x000000000000000000000000' || '${delegatorAddress}')::bytea)
    SELECT *
    FROM staking_events
    ORDER BY block_id, tx_offset DESC
    LIMIT 1
    ;
`;
};

const getRewardsQuery = (topicHash, delegatorAddress, startBlock, endBlock) => {
    // -- All reward redeemed events by sender between block heights
    delegatorAddress = delegatorAddress.slice(2);
    let stakingAddress = STAKING_ADDRESS.slice(2);
    return `
        SELECT *
        FROM chain_moonbeam_mainnet.block_log_events ble join chain_moonbeam_mainnet.block_transactions t on ble.block_id = t.block_id and ble.tx_offset = t.tx_offset
        WHERE
        ble.topics @>
            ARRAY [('\\x${topicHash}')::bytea]
        AND ble.sender = '\\x${stakingAddress}'
        AND t.from = '\\x${delegatorAddress}'
        AND ble.block_height BETWEEN ${startBlock} AND ${endBlock}
        ;
        `;
};


const getComissionRewardRedeeemEventsBetweenTwoBlockHeightsQuery = (delegatorAddress, startBlock, endBlock) => {
    let topicHash = "ca484c45ad2d2422ff409731d1783446054a9a6549f63f4e668f85d03513624c";
    return getRewardsQuery(topicHash, delegatorAddress, startBlock, endBlock);
};


const getRewardRedeeemEventsBetweenTwoBlockHeightsQuery = (delegatorAddress, startBlock, endBlock) => {
    let topicHash = "bf3f2aa111a63b63567f864e18723c486b9276b75fdadebb83f62cd228263e0c";
    return getRewardsQuery(topicHash, delegatorAddress, startBlock, endBlock);
};

const sendRequest = async (URL) => {
    let isError = true;
    let r = "";
    while (isError) {
        console.log(URL);
        r = await axios.get(URL)
            .then(res => {
                if (res.data.data.items.length == 0)
                    return 1;

                return res.data.data.items;
            })
            .catch(err => {
                console.log('Error: ', err.message);
                return false;
            });
        console.log(1 == false);
        if (r == 1)
            return undefined;
        isError = r == false;
        if (isError)
            await sleep(3000);
    }
    return r;
};

const getFirstStakeEventDate = async (client, delegator) => {
    let query = getFirstStakeEventString(delegator);
    let r = await client.query(query);
    return r.rows[0].date;
};

const getAllRewardRedemptionsBetweenBlockHeights = async (client, startBlock, endBlock, delegator) => {
    let query1 = getRewardRedeeemEventsBetweenTwoBlockHeightsQuery(delegator, startBlock, endBlock);

    let r1 = await client.query(query1);
    r1 = r1.rows.map(row => abiCoder.decode(["uint128"], row.data));

    let query2 = getComissionRewardRedeeemEventsBetweenTwoBlockHeightsQuery(delegator, startBlock, endBlock);

    let r2 = await client.query(query2);
    r2 = r2.rows.map(row => abiCoder.decode(["uint128"], row.data));

    return r1.concat(r2);
};

const getFirstBlockForDate = async (date, nextDate) => {
    let URL = "https://api.covalenthq.com/v1/" + CHAIN_ID + "/block_v2/" + date + "/" + nextDate + "/?&key=" + COVALENT_API_KEY + "&page-size=10";
    let r = await sendRequest(URL);
    if (r == undefined)
        return undefined;
    r = r.sort((a, b) => (a.height > b.height) ? 1 : -1);
    return r[0].height;
};

const getBlockHeightsBetweenTwoDates = async (startDate, endDate) => {
    let endDate1 = startDate.split('-');
    endDate1 = (parseInt(endDate1[0]) + 1) + '-' + endDate1[1] + '-' + endDate1[2];
    let end = (await getFirstBlockForDate(endDate, endDate1)) - 1;
    if (isNaN(end))
        return undefined;
    let start = await getFirstBlockForDate(startDate, endDate);
    if (start == undefined)
        return undefined;
    return {
        startBlock: start,
        endBlock: end
    };
};


const writeRecords = async (data, writer) => {
    await writer
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'))
        .catch((err) => {
            console.log('Save failed', err);
        });
};

const getClient = async () => {
    var client = new Client({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        host: process.env.PGHOST,
        ssl: true
    });
    await client.connect();
    return client;
};


async function getRewardsAtBlock(blockHeight, delegator) {
    const [signer] = await ethers.getSigners();
    let staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
    let totalRewards = zero();
    let totalStaked = zero();
    validatorN = (await staking.getMetadata({ gasLimit: 15000000, blockTag: blockHeight }))._validatorsN;

    for (let index = 0; index < validatorN; index++) {
        let delegatorData = await staking.getDelegatorMetadata(delegator, index, { gasLimit: 15000000, blockTag: blockHeight });
        totalRewards = totalRewards.add(delegatorData.rewards).add(delegatorData.commissionEarned);
        totalStaked = totalStaked.add(delegatorData.staked);
    }
    console.log("Reached here");
    return { rewards: totalRewards, staked: totalStaked };

}

async function getDelegatorRewardsByMonth(startDate, endDate, client, oldRewards, delegator) {
    let blocks = await getBlockHeightsBetweenTwoDates(startDate, endDate);
    if (blocks == undefined) {
        return { oldRewards: zero(), rewardsEarned: zero(), staked: zero() };
    }
    let startBlock = blocks.startBlock;
    let endBlock = blocks.endBlock;

    if (endBlock == 1346017 && delegator == WOODSTOCK_2)
        endBlock = 1336010;
    if (startBlock == 1346018 && delegator == WOODSTOCK_2) {
        startBlock = 1336011;
    }
    let rewardsRedeemed = await getAllRewardRedemptionsBetweenBlockHeights(client, startBlock, endBlock, delegator);
    let rewardRedeemedSum = rewardsRedeemed.reduce(
        (accumulator, currentValue) => {
            return accumulator.add(currentValue[0]);
        },
        zero()
    );
    let rewardAvailableAtEndBlock = await getRewardsAtBlock(endBlock, delegator);

    let rewardsEarned = rewardAvailableAtEndBlock.rewards.add(rewardRedeemedSum).sub(oldRewards);

    oldRewards = rewardAvailableAtEndBlock.rewards;
    return { oldRewards: rewardAvailableAtEndBlock.rewards, rewardsEarned: rewardsEarned, staked: rewardAvailableAtEndBlock.staked };

}

function formatDate(item) {
    return item < 10 ? "0" + item : item;
}

function getMonthDates(startDate) {
    let year = startDate.getFullYear();
    let month = startDate.getMonth() + 1;
    let startDay = startDate.getDate();

    let newStartDate = year + "-" + formatDate(month) + "-" + formatDate(startDay);
    let nextMonth = month + 1 == 13 ? 1 : month + 1;
    let nextYear = nextMonth == 1 ? year + 1 : year;

    let endDate = nextYear + "-" + formatDate(nextMonth) + "-01";
    let nextStartDate = new Date(nextYear, nextMonth - 1, 1);
    return {
        startDate: newStartDate,
        endDate: endDate,
        nextStartDate: nextStartDate
    };
}

function getDatesUntilNow(startDate) {
    let currentDate = new Date();
    let dates = [];
    while (startDate < currentDate) {
        let datesObject = getMonthDates(startDate);
        dates.push(datesObject);
        startDate = datesObject.nextStartDate;
    }
    return dates;
}

async function getDelegatorRewards(name, delegator, client) {
    let startDate = await getFirstStakeEventDate(client, delegator);
    let dates = getDatesUntilNow(startDate);
    let oldRewards = zero();
    let rewardsByMonth = [];

    for (let index = 0; index < dates.length; index++) {
        const dateObject = dates[index];
        const res = await getDelegatorRewardsByMonth(dateObject.startDate, dateObject.endDate, client, oldRewards, delegator);
        let row = [name, delegator, dateObject.startDate, dateObject.endDate, res.staked.toString(), res.rewardsEarned.toString()];
        oldRewards = res.oldRewards;
        rewardsByMonth.push(row);
    }
    return rewardsByMonth;
}

async function main() {
    const writer = createCsvWriter({
        path: 'rewards_earned_by_month.csv',
        header: ["Delegator Name", "Delegator", "Start Date", "End Date", "Total Staked", "Rewards Earned"]
    });

    const client = await getClient();
    let names = [
        "ADRIAN",
        "PRANAY",
        "RODRIGO",
        "KATERINA",
        "Covalent Foundation Node"
        // "Woodstock 1",
        // "Woodstock 2"
    ];
    let delegators = [
        "0xe631A4cED384a6255DbbCB1ABA78d27D86288405",
        "0xD65B585e272c863e9e071ED3B8F600ABEF75425C",
        "0x9e51c878E2E889812670955628366BA8f3cB6879",
        "0x7AA581be4c28779Ba45ecE185faEE9EFfC8c0cA4",
        "0xfaae07bac050bee1efc1a589be6629c3775f3272"
        // "0xa312f7156a2f4290d53e5694afe44e9cc7f1b811",
        // WOODSTOCK_2
    ];

    let concatRows = [];
    for (let index = 0; index < delegators.length; index++) {
        const delegator = delegators[index];
        let rows = await getDelegatorRewards(names[index], delegator, client);
        concatRows = concatRows.concat(rows);
    }

    await client.end();

    await writeRecords(concatRows, writer);
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });