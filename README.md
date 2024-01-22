
# Covalent contest details

- Join [Sherlock Discord](https://discord.gg/MABEWyASkp)
- Submit findings using the issue page in your private contest repo (label issues as med or high)
- [Read for more details](https://docs.sherlock.xyz/audits/watsons)

# Q&A

### Q: On what chains are the smart contracts going to be deployed?
Proofchain Contract - Moonbeam
Staking Contract - Ethereum
___

### Q: Which ERC20 tokens do you expect will interact with the smart contracts? 
CQT
___

### Q: Which ERC721 tokens do you expect will interact with the smart contracts? 
none
___

### Q: Do you plan to support ERC1155?
No
___

### Q: Which ERC777 tokens do you expect will interact with the smart contracts? 
none
___

### Q: Are there any FEE-ON-TRANSFER tokens interacting with the smart contracts?

none
___

### Q: Are there any REBASING tokens interacting with the smart contracts?

none
___

### Q: Are the admins of the protocols your contracts integrate with (if any) TRUSTED or RESTRICTED?
Trusted
___

### Q: Is the admin/owner of the protocol/contracts TRUSTED or RESTRICTED?
Trusted
___

### Q: Are there any additional protocol roles? If yes, please explain in detail:
Staking Contract:
Roles:
 1) Staking Manager
   What the StakingManager can do:
- Set the validator commission rate
- Add validator instances to the contract
- Reward validators
- Disable/Enable validators
 
 2) Owner
    What the Owner can do:
- Deposit tokens into the contract that will be distributed (reward pool)
- Withdraw tokens from the contract that are supposed to be distributed. The owner cannot withdraw tokens allocated for the past checkpoints that have not yet been redeemed by the delegators
- Set the validator max cap multiplier
- Set the maximum number of tokens the validator can stake
- Set the StakingManager address
- Renounce his role and disable all the following listed actions by calling renounceOwnership
- Transfer the ownership to another address by calling transferOwnership
- Set or change the stakingManager by calling setStakingManagerAddress

ProofChain Contract:
Roles:
- Manager - Enable/Disable operator instances
- Owner - add/remove governers, upgrade the contract
- Governor - add/remove BSP operators, add/remove auditors, set staking contract address, set quorum threshold, set block divisor (nth block), set reward allocated, set session duration, set chain sync data, set max submissions per block height, set min submissinos required, set validators commission rate
- Auditor - Arbitrate sessions
- BSP(Block Specimen Producer) Operator - Submit proofs

___

### Q: Is the code/contract expected to comply with any EIPs? Are there specific assumptions around adhering to those EIPs that Watsons should be aware of?
No
___

### Q: Please list any known issues/acceptable risks that should not result in a valid finding.
none
___

### Q: Please provide links to previous audits (if any).
N/A
___

### Q: Are there any off-chain mechanisms or off-chain procedures for the protocol (keeper bots, input validation expectations, etc)?
none
___

### Q: In case of external protocol integrations, are the risks of external contracts pausing or executing an emergency withdrawal acceptable? If not, Watsons will submit issues related to these situations that can harm your protocol's functionality.
No
___

### Q: Do you expect to use any of the following tokens with non-standard behaviour with the smart contracts?
None
___

### Q: Add links to relevant protocol resources
https://www.covalenthq.com/docs/covalent-network/
___



# Audit scope


[cqt-staking @ 80a254a3a57e6cb7983aa057d2f77877e296806e](https://github.com/covalenthq/cqt-staking/tree/80a254a3a57e6cb7983aa057d2f77877e296806e)
- [cqt-staking/contracts/BlockSpecimenProofChain.sol](cqt-staking/contracts/BlockSpecimenProofChain.sol)
- [cqt-staking/contracts/OperationalStaking.sol](cqt-staking/contracts/OperationalStaking.sol)


