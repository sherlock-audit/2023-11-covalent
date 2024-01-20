# Testnet onboarding steps
1. Make sure env var `MOONBEAM_ALPHA_OWNER_PR` is set up.
2. Replace values in `scripts/testnet-onboarding/testnet_operators.csv` with the validators to add.
3. To add validators to Staking contract and emit test CQT run
   
   `npx hardhat run scripts/testnet-onboarding/addValidators.js --network moonbaseAlpha`
   
    wait couple minutes until all the txs go through. You can run the script second time later, it will not add duplicate validators unless a tx from the first run is not finalized on the blockchain. 
4. To add operators run
  
   `npx hardhat run scripts/testnet-onboarding/addOperators.js --network moonbaseAlpha`

   wait couple minutes until all the txs go through. You can run the script second time later, it will not add duplicate operators unless a tx from the first run is not finalized on the blockchain.
5. To check all the data on the contracts run

   `npx hardhat run scripts/testnet-onboarding/checkData.js --network moonbaseAlpha`

   
