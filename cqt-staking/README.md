# cqt-staking

[![codecov](https://codecov.io/gh/covalenthq/cqt-staking/branch/main/graph/badge.svg?token=VFEMI1ZKW6)](https://codecov.io/gh/covalenthq/cqt-staking)

## Hardhat

[Getting started](https://hardhat.org/getting-started/)

- To start a node: `npx hardhat node`
- To compile: `npx hardhat compile`
- To run all tests: `npx hardhat test`
- To run a specific test: `npx hardhat test path/to/test`
- To export abi: `npx hardhat export-abi`

# Set up

### Installation

1. Clone repo
2. Run `npm install`
3. Setup environment variables. Create .envrc file and add the following:
```
export ERIGON_NODE=""
export CQT_NODE=""

export CQT_NETWORK_CONTRACT_OWNER=""
export MOONBEAM_TEST_PROOFCHAIN_GOVERNOR=""
export MOONBEAM_PROD_PROOFCHAIN_GOVERNOR=""

export MOONBEAM_PROD_PROOFCHAIN_ADDRESS=""
export MOONBEAM_TEST_PROOFCHAIN_ADDRESS=""
export CQT_PROOFCHAIN_ADDRESS=""

export MOONBEAM_PROD_STAKING_ADDRESS=""
export MOONBEAM_TEST_STAKING_ADDRESS=""
export CQT_STAKING_ADDRESS=""

export ETHEREUM_CQT_ADDRESS=""
export CQT_CQT_ADDRESS=""
export MOONBEAM_CQT_ADDRESS=""
```
Fill out the blank values. Ask Levi for ERIGON_NODE, CQT_NODE, CQT_NETWORK_CONTRACT_OWNER, MOONBEAM_TEST_PROOFCHAIN_GOVERNOR and MOONBEAM_PROD_PROOFCHAIN_GOVERNOR. Check [the notion page](https://www.notion.so/covalenthq/Contract-Addresses-b0a73873d73f486e88c6de455c09aaa6) to find the rest.

### Testing

#### Run

`npx hardhat test ./test/cqt-staking/unit-tests/*`

`npx hardhat test ./test/cqt-staking/integration-tests/all`

`npx hardhat test ./test/proof-chain/unit-tests/*`

`npx hardhat coverage --testfiles "./test/cqt-staking/unit-tests/*`

`npx hardhat coverage --testfiles "./test/proof-chain/unit-tests/*`


### Running scripts to deploy contracts and set up contracts' variables

For every script there is an option to either
1. Use default deployed contract address by network (these are the values set up in .envrc file). There are 3 main options for network: `cqt` (internal covalent network), `moonbeamTestContracts` (this will use our test contracts on Moonbeam by default) and `moonbeamProdContracts` (this will use our prod contract on Moonbeam by default).
2. Enter the values for the contract addresses and the values related to the tx in command line prompt. This is when you want to use the script only once.
3. Write your own values in the script file and use these. This is when you do not want to enter values in command line prompt each time (in case if you want to run the script multiple times). In each file there are default values to be used, so edit these. Here is [an example](https://github.com/covalenthq/cqt-staking/blob/feature/add-readme-for-scripts-running/scripts/addNewOperatorToExistingValidator.js#L6).


When you run a script the prompt will automatically ask you which option you want to do. Finally it will print all the values used and ask for your confirmation before running the tx.

#### Run
`npx hardhat run scripts/scriptName.js --network networkName`

### Multisig Upgrade (It needs to be done in `bsp-staking` repo)

#### Part 1: Make Proposal
1. Make sure you are in [bsp-staking](https://github.com/covalenthq/bsp-staking) repo otherwise the solidity compiler will generate two different bytecodes.
2. Make sure you are on the right branch.
3. Make sure you have an account and acquired API keys with [Defender](https://defender.openzeppelin.com).
Create `.envrc` file and add the following:
```
export DEFENDER_SECRET_KEY=""
export DEFENDER_API_KEY=""
export MOONBEAM_NODE="https://rpc.api.moonbeam.network"
export MOONBEAM_ACCOUNT_1="" // your moonbeam account private key, used for proofchain data maintanance
export STAKING_ADDRESS="" // address of the staking contract you want to upgrade
export PROOFCHAIN_ADDRESS="" // address of the proofchain contract you want to upgrade
```
3. Run the script to create an upgrade proposal

For Staking upgrade run:
```
npx hardhat run scripts/staking-multisig-upgrade.js --network moonbeam
```

For ProofChain upgrade run:
```
npx hardhat run scripts/proofchain-multisig-upgrade.js --network moonbeam
```

**Copy and save the generated url with the proposed upgrade.**

4. Commit the generated build artifact containing the contract bytecode as this file is necessary for upgrade proposal verification.

For Operational Staking:
```
git add -f artifacts/contracts/OperationalStaking.sol/OperationalStaking.json
git cis -m 'update OperationalStaking build artifact'
git push
```

For ProofChain:
```
git add -f artifacts/contracts/ProofChain.sol/ProofChain.json
git cis -m 'update ProofChain build artifact'
git push
```

5. Copy github link of the committed artifact.
6. Go to defender and apply to on-chain bytecode verification using the url of the committed artifact. The path to the file and name of the contract can be found inside the artifact.

#### Part 2: Verification and approval of the contract upgrade:
1. Make sure the env variables from Part 1 are set up.
2. Go to the generated url to access the upgrade proposal (alternatively this can be found on the defender admin dashboard).
3. Go to `bsp-staking`
4. Delete `artifacts/contracts` folder
5. Run
```
npx hardhat compile
```
6. Perform the following checks:
- Check if the locally generated artifacts/contracts/OperationalStaking.sol/OperationalStaking.json matchs the one committed in the bsp-staking repo
- Check if the link submitted in Defender under  “ON-CHAIN BYTECODE VERIFICATION STATUS” section matches the url with the committed artifact file (artifacts/contracts/OperationalStaking.sol/OperationalStaking.json ). Just go to the github repo, open raw file and check the url. Alternatively you can verify the SHA256 yourself using https://emn178.github.io/online-tools/sha256.html. Just copy deployedBytecode and past it as an input. Remove the first 0x from the string and select input type as hex. This should match the two displayed under  “ON-CHAIN BYTECODE VERIFICATION STATUS” section.

7. Approve the upgrade


#### Transfer Ownership
There are two owners: the main contract owner and the ProxyAdmin contract owner (the one used for upgrading the main contract). Check [transferStakingOwner](https://github.com/covalenthq/cqt-staking/blob/main/scripts/transferStakingOwner.js) and [transferStakingProxyAdminOwner](https://github.com/covalenthq/cqt-staking/blob/main/scripts/transferStakingProxyAdminOwner.js). Note Staking and ProofChain contracts both have the same ProxyAdmin so transferring the ownership of the ProxyAdmin should be done once and it will affect both Staking and ProofChain contracts.

# Summary
This repo contains two contracts: ProofChain and Staking which are part of the Covalent Network. They were designed with the purpose to enable the Covalent Staking program.

Operators stake their tokens, do work by running nodes, submit a proof of work to the ProofChain and receive rewards in CQT tokens. If enough operators get the same result of work, then quorum is achieved, the rewards are emitted and pushed from the ProofChain to the Staking. Additionally, delegators (these who do not run nodes) can delegate their tokens under the operators and receive rewards. The delegators will have to pay commission fees to the operators.

For the detailed explanation of what is Covalent Network and what kind of work the operators do please refer to the [white paper](https://www.covalenthq.com/static/documents/Block%20Specimen%20Whitepaper%20V1.2.pdf).

![image](https://user-images.githubusercontent.com/14303197/165625028-e6676cfb-1b52-47d4-bdc8-97ff95db18dd.png)




# Staking Explained

### The goal:

To distribute tokens to stakers.

The reward emission will be pushed from the ProofChain contract every checkpoint. A checkpoint is defined as a transaction in which the rewards are pushed and will happen every couple of blocks. The checkpoint transaction determines the rewards amount, hence it is unknown how many rewards will be pushed to a validator beforehand.

There are four types of entities: Validators (the network operators who self-delegate), Delegators (who delegate tokens to the validators), the Owner (Covalent) and the StakingManager (ProofChain contract).

Delegators pay commission fees from their earned reward based on the commission rate dictated by validators. The validators will be added to the contract by the StakingManager and will be disabled until the StakingManager activates its instance.

### Validators are subject to the following constraints:

- If a validator misbehaves (does not run a Covalent node or cheats), the StakingManager can disable the validator instance on the contract. The StakingManager will call disabledValidator/enableValidator functions on the Staking contract.
- Maximum # of tokens that can be staked (self-delegated) by a validator.
- Validator max cap - is the maximum number of tokens the delegators can cumulatively delegate to a validator. That number is determined by the following formula: `#_of_tokens_staked_by_validator * validator_max_cap_multiplier`, where `validator_max_cap_multiplier` is a number that is set by Covalent. </br>
  An example of max cap: </br>
  Assuming validator_max_cap_multiplier is set to `10`, then a validator comes and stakes 1 million tokens. The max cap of the validator is `10 * 1 million = 10 million`. So delegator `A` comes and delegates `3 million`, delegator `B` - `2 million`, and delegator `C` - `5 million`. In other words, the total number of tokens delegated already equals the maximum cap of `10 million`. Thus, a new delegator 'D' cannot delegate tokens to the validator unless someone unstakes their tokens.
- A validator cannot unstake tokens that would reduce the maximum cap below what is already delegated. If a validator is willing to do so, the validator will have to disable itself through the StakingManager. The delegators will stop earning the rewards from that validator, but they will have an option to redelegate tokens to another validator without a cool down period. The validator can enable its instance back through the StakingManager.
- It is allowed for the same validator address to have multiple ids.
- When changing its address a validator cannot transfer unstakings if there are more than 300 of them. This is to ensure the contract does not revert from too much gas used. In case if there are more than 300 unstakings, there is an option to transfer the address without unstakings.

### Additional constainsts:
- Due to potential conversion overflow and precision loss there is a constaint that requires the staked and rewards amounts to be greater than REWARD_REDEEM_THRESHOLD. Currently it is set to 0.0000000001 CQT. Hence, if not the full amount is unstaked or redeem there is a potential lock of the remaining 0.0000000001.

### Redeeming Rewards:

Delegators and validators can decide whether to withdraw all of their rewards or just a portion of them and may do so at any time without a cool-down period. To support certain use cases like pseudoanonymity preservation, the users can set a different address from their wallet address to which rewards will be transferred.


### Unstaking:

Validators who self-delegate will have to wait 180 days for their unstaking to be unlocked, while delegators have to wait 28 days. Once unstaking is unlocked, tokens can be transferred back into the delegator's or validator's wallet.
An unstaked amount can always be recovered: The unstaked amount (partially or in full) can be delegated back to the same validator.

### What the owner can do:

- Deposit tokens into the contract that will be distributed (reward pool)
- Withdraw tokens from the contract that are supposed to be distributed. The owner cannot withdraw tokens allocated for the past checkpoints that have not yet been redeemed by the delegators
- Set the validator max cap multiplier
- Set the maximum number of tokens the validator can stake
- Set the StakingManager address
- Renounce his role and disable all the following listed actions by calling renounceOwnership
- Transfer the ownership to another address by calling transferOwnership
- Set or change the stakingManager by calling setStakingManagerAddress

### What the StakingManager can do:

- Set the validator commission rate
- Add validator instances to the contract
- Reward validators
- Disable/Enable validators

### What a validator can do:

- Redeem rewards (from commissions paid to them and their earned interest)
- Stake or self-delegate
- Unstake
- Transfer out unlocked unstake
- Restake back unstake
- Change validators' address

_Note: Validators cannot set their commission rate, and if they wish to change it, they must contact Covalent. Commission rates are initially set when the StakingManager adds a validator for the first time._

### What a delegator can do:

- Redeem rewards (their earned interest)
- Stake
- Re-delegate from disabled validator. A delegator first has to unstake then re-delegate unstaked. If a validator gets enabled back, a delegator cannot re-delegate unstake, but she or he can recover that unstake back to the current validator.
- Unstake
- Transfer out unlocked unstake
- Restake back unstake

### Staking contract does not need to know:

- how rewards are calculated per validator per checkpoint
- how it's decided when validator gets disabled

### Staking Math

Assume tokens are emitted at checkpoint = 1000

- Epoch 1 - person `A` stakes `10,000` tokens and no one else has anything staked
- Epoch 2 -
  person `A` receives `1,000` tokens reward which is `100%` of tokens emitted at a particular checkpoint <br />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;person `B` stakes `20,000` tokens
- Epoch 3 -
  person `A` receives `355` tokens since that person's ratio of tokens staked is `35.5% = 11,000 / (11,000 + 20,000)` <br />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;person `B` receives `645` tokens since that person's ratio of tokens staked is `64.5% = 20,000 / (11,000 + 20,000)`

| Checkpoint # | Staked by A | New staked added by A | Ratio owned by A | Staked by B | New staked added by B | Ratio owned by B |
| ------------ | ----------- | --------------------- | ---------------- | ----------- | --------------------- | ---------------- |
| Checkpoint 1 | 0           | 10,000                | 0                | 0           | 0                     | 0                |
| Checkpoint 2 | 11,000      | 0                     | 100%             | 0           | 20,000                | 0                |
| Checkpoint 3 | 11,355      | 0                     | 35.5%            | 20,645      | 0                     | 64.5%            |

### Staking Math Contract Implementation

We use the concept of ratios or in other words, exchange rates.
Each validator has its own exchange rate. Stakers buy validator shares.
When they unstake or redeem the rewards, they sell the shares. Selling means these shares get burnt.

- Initially the validator exchange rate is `1 share = 1 token`.

- Then staker `A` comes and stakes `10,000` tokens, it receives `10,000` validator shares.

- Assume at the next checkpoint the emission is `1000` tokens, and the validator commission rate is `25%`.

- Then `1000` tokens will be distributed to the stakers.

- Since there is a commission rate of `25%`, `250` tokens will go towards commission paid, and `750` tokens are distributed among the validator shares.

- Then the validator exchange rate would be:

`old_validator_exchange_rate + 750 tokens / 10,000 validator shares = 1 + 0.075 = 1.075`

- So `1 validator share = 1.075` tokens, a validator will have `250` commission tokens available to redeem.

### Precision Loss

There is a slight precision loss in rewards calculation. It is acceptable as long as it is small enough (less than ~ 0.01 a day).

### Assumptions

- Cool down periods might be changed with the next upgrade, so these are not constant.
- Commission earned by validators is not compounded towards the shares that the validator has
- The contract is upgreadable


# Proof Chain Explained

### The goal:

Allow operators to submit proofs of work.

There are five types of entities: Owner, Block Specimen Producer (BSP), Block Specimen Producer Manager, Auditor and Governer. The Block Specimen Producer is an operator who runs a covalent node and submits proofs of work to the ProofChain. The Block Specimen Producer Manager is an account the operator uses to enable/disable its operator instances. An Auditor is an operator who arbitrates sessions that did not reach quorum. A Governer is an entity who can add or remove operators and set additional storage variables.

Currently, only Operators approved by Covalent can perform the BSP role and Covalent performs the auditor and governer roles.

### The flow:
1. A network operator gets added on the ProofChain and Staking contracts by Covalent.
2. The operator stakes CQT on the Staking contract using its staking wallet.
3. The operator enables its instance on the ProofChain.
4. The delegators delegate their CQT tokens under the operator instance.
6. The operator produces a Block Specimen and submits proofs of work in the form of Block Specimen Hashes to the ProofChain. This starts a new session for that corresponding block.
7. Other operators submit the proofs for the same session as well.
8. Once the session deadline has reached, a separate agent invokes a finalize transaction. Here it gets determined if the quorum was reached or not. Achieving the quorum means a majority submitted the same Block Specimen Hash.
9. If quorum is achieved the participants who submitted the agreed specimen hashes get rewarded. The rewards are pushed from the ProofChain to the Staking. If quorum was not achieved nothing happens. In both cases at the end of the transaction, the session gets marked as `requires audit`.
10. Sometimes the nodes may end up submitting hashes for reorg blocks and Covalent wants to reward these too. The auditor will be arbitrating these submissions.


## Role Management

In order for a BSP Operator to be able to submit the proofs, its instance must be enabled on the ProofChain contract. Enabling/disabling an Operator on the ProofChain will enable/disable its Validator instance on the Staking contract. On the ProofChain enabling/disabling is done by the BSP Manager address which is the Validator address on the Staking contract. One BSP Manager can manage multiple BSP Operators.

## Session explained

A session starts when an operator submits the first proof per `chain id` per `block height`. A Block Specimen is an object generated by replicating block data. Block Specimens are generated by running a geth node with Covalent's Block Specimen Production agent: [bsp-agent](https://github.com/covalenthq/bsp-agent). A hash of the Block Specimen gets submitted to the ProofChain and acts as a proof of work.

### Session contraints/requirements
- **minimum stake** - operators must stake a minimum number of tokens on the Staking contract to participate
- **block-divisor** - block specimens are produced only for every nth block.
- **max specimen submissions per block height** - the same operator might submit multiple block specimens per block height due to potential reorgs
- **session duration** - in blocks
- **live sync** - the contract has a mapping of the _sink_ chain block height to the _source_ chain block height that allows the application of a constraint that enables submissions for block specimens of the current/recently mined blocks
- **reward per block hash** - is distributed per block hash rather than per session
- **min submissions** - to achieve quorum, there should be at least a minimum number of submissions of the agreed hash

### Session submission parameters
- chain id
- block height
- block hash
- specimen hash
- storage URL

## Reward Distribution

The reward is allocated per block hash and distributed between the participants who submitted the agreed (when the quorum is achieved) or correct (in case of reorg) specimen hash. The reward is distributed proportionally to how much each operator has staked and how much is delegated to that operator.

### Optimistic phase

The optimistic phase happens when enough participants have submitted the same block specimen hash and quorum is achieved.

### Pessimistic phase

In the pessimistic phase the auditor makes `arbitrateBlockSpecimenSession()` transaction providing the correct block specimen hash. The Pessimistic phase may happen in the following 2 cases:
- when quorum was not achivied.
- when quorum was achivied, but the operators have submitted hashes for reorg blocks that are still valid. The auditor will be running a node and regenerate the reorgs to find valid block specimen hashes.

The pessimistic phase will be fully implemented later.

### Examples

Assuming the required quorum is set to > 50%.

#### Case 1 - Quorum achieved, only Optimistic Phase

Block Hash A
- 5 submissions of specimen hash A'
- 2 submissions of specimen hash A''


##### Optimistic phase

~71% (5 out 7) participants submitted specimen hash A'. The quorum is achieved. The submitters of the specimen hash A' receive the reward. These who submitted A'' do not receive anything.

##### Pessimistic phase

Not required since the quorum was achieved and no other block hashes submitted.


#### Case 2 - Quorum not achieved, Pessimistic Phase happens

Block Hash A
- 2 submissions of specimen hash A'
- 2 submissions of specimen hash A''


##### Optimistic phase

50% of participants submitted specimen hash A' and A''. The quorum is not achieved. No one receives the reward in the optimistic phase.


##### Pessimistic phase

The auditor arbitrates the session and decides that the specimen hash A' is correct. The submitters of the specimen hash A' receive the reward.


#### Case 3 - Quorum is achieved, Pessimistic Phase happens

Block Hash A
- 5 submissions of specimen hash A'
- 2 submissions of specimen hash A''

Block Hash B
- 1 submissions of specimen hash B'
- 1 submissions of specimen hash B''


##### Optimistic phase

~55% (5 out 9) participants submitted specimen hash A'. The quorum is achieved. The submitters of the specimen hash A' receive the reward. These who submitted A'' do not receive anything.


##### Pessimistic phase

The auditor arbitrates the session for block hash B and decides that the specimen hash B'' is correct. The submitters of the specimen hash B'' receive the reward and these who submitted B' do not receive anything.


#### Case 4 - Quorum not achieved, Pessimistic Phase happens

Block Hash A
- 5 submissions of specimen hash A'
- 2 submissions of specimen hash A''

Block Hash B
- 1 submissions of specimen hash B'
- 1 submissions of specimen hash B''
- 1 submissions of specimen hash B'''

Block Hash C
- 7 submissions of specimen hash C'

Block Hash D
- 2 submissions of specimen hash D'
- 3 submissions of specimen hash D''


##### Optimistic phase

The quorum is not achieved since no specimen hash has >50% of submitters. No one receives the reward in the optimistic phase.

##### Pessimistic phase

The auditor arbitrates the session for all the submitted block hashes: A, B, C and D. It decides that the specimen hashes A', B''', D' are correct. The corresponding submitters receive the reward. The submitters of the specimen hashes A'', B', B'', C' and D'' do not receive anything



## Functionalities

##### What Block Specimen Producer Operator can do
- submit proofs

##### What Block Specimen Producer Operator Manager can do
- enable/disable its operator instances

##### What Auditor can do
- arbitrate sessions

##### What Governer can do
- add/remove BSP operators
- add/remove auditors
- set staking contract address
- set quorum threshold
- set block divisor (nth block)
- set reward allocated
- set session duration
- set chain sync data
- set max submissions per block height
- set min submissinos required
- set validators commission rate

#### What Owner can do
- add/remove governers
- upgrade the contract






