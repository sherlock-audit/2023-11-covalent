### Key

SC: staking contract
PC: proofchain contract
BA: bridge agent

### staking manager role

- The bridge agent owns a "staking manager" role, which is present on both SC and PC contract. Using this role, the bridge agent makes the state sync changes required on both the contracts
- the existing `stakingInterface` on the PC is deprecated and no longer required.
- BA listens to events on each contract and responds accordingly to do the require state sync.

### Flow of information

#### disable/enable validator

SC.enableValidator -> (BA) -> PC.enableValidator

#### add/remove operator

PC.addBRPOperator -> (BA) -> SC.enableValidator -> (BA) -> PC.enableValidator

NOTE: SC.enableValidator has additional checks like staking requirements. Only after those have been satisfied, is the validator state in PC enabled.

#### remove operator

PC.removeBSPOperator -> (BA) -> (if active operator count=0) SC.disableValidator -> (BA) -> PC.disableValidator

#### stake

SC.stake() -> BA -> (only if validator disabled and operators added) SC.enableValidator -> BA -> PC.enableValidator

### effects of using delayed postgres listening

As txs come on either chain, they have to be processed by the bridge agent. But what happens if there are reorgs? A 3 minute delay should be enough, given that both ethereum and moonbeam are PoS and have rarer block reorgs (7 is the highest on ethereum beacon chain.)

Because the stake resides on ethereum only, and unstake/stake functions can happen only on SC. There's no double spend problem that can occur here.

Note that SC.unstake() emits a ValidatorDisabled, which causes PC.disableValidator; but this takes time to propagate, and so PC will still accepts proofs for that period. However, they won't be rewarded because the "stake state" for rewards will be picked out from around the time unstake was done (there might not be exact correspondence between staking block and PC block.)

---

#### UI notes:

user flow:

- only stake button available.
- Once staked, and if operators are added (By Covalent) in the backend, the validator is enabled on SC/PC

---

## tests needed

- [x] staking manager changed (event emitted)
- [x] adding multiple brp operators and then removing or disabling one, and the event emitted has the correct count
- [x] initialize can call setStakingManager (while can only be called by governor)
- [x] mock bridge agent: when remove/disable brp is called, bridge agent calls disableValidator or enableValidator
- [x] mock bridge agent: setValidatorAddress can be called only by staking manager.
- [x] proofs submitted and finalizeResultSession is called; BlockResultQuorum should be emitted with appropriate validator ids bitmap set. (same with block specimen)
- [ ] inspect state and see if the appropriate state is released/deleted once the quorum is reached -- parked.
- [x] test QuorumNotReached

---

- [ ] UI needs to do APR calculation from db maintained by bridge agent
