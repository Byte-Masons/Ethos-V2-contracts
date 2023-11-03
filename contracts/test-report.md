# Test output
The following is the output of a complete test run, made on commit [`0a255b41`](https://github.com/Byte-Masons/Ethos-V2-contracts/commit/0a255b41e7435f675c5b6e262a5f434663427afe), from November 3rd, 2023.

```
$ npx hardhat test


  Contract: Access Control: Liquity functions with the caller restricted to Liquity contract(s)
    TroveManager
      ✔ applyPendingRewards(): reverts when called by an account that is not BorrowerOperations
      ✔ updateRewardSnapshots(): reverts when called by an account that is not BorrowerOperations
      ✔ removeStake(): reverts when called by an account that is not BorrowerOperations
      ✔ updateStakeAndTotalStakes(): reverts when called by an account that is not BorrowerOperations
      ✔ closeTrove(): reverts when called by an account that is not BorrowerOperations
      ✔ addTroveOwnerToArray(): reverts when called by an account that is not BorrowerOperations
      ✔ setTroveStatus(): reverts when called by an account that is not BorrowerOperations
      ✔ increaseTroveColl(): reverts when called by an account that is not BorrowerOperations
      ✔ decreaseTroveColl(): reverts when called by an account that is not BorrowerOperations
      ✔ increaseTroveDebt(): reverts when called by an account that is not BorrowerOperations
      ✔ decreaseTroveDebt(): reverts when called by an account that is not BorrowerOperations
    CollateralConfig
      ✔ updateCollateralRatios(): reverts when called by an account that is not Owner
    RedemptionHelper
      ✔ redeemCollateral(): reverts when called by an account that it not TroveManager (285ms)
    ActivePool
      ✔ sendCollateral(): reverts when called by an account that is not BO nor TroveM nor SP nor LH
      ✔ increaseLUSDDebt(): reverts when called by an account that is not BO nor TroveM
      ✔ decreaseLUSDDebt(): reverts when called by an account that is not BO nor TroveM nor SP nor RH
      ✔ pullCollateral(): reverts when called by an account that is not Borrower Operations nor Default Pool
    DefaultPool
      ✔ sendCollateralToActivePool(): reverts when called by an account that is not TroveManager
      ✔ increaseLUSDDebt(): reverts when called by an account that is not TroveManager
      ✔ decreaseLUSD(): reverts when called by an account that is not TroveManager
      ✔ pullCollateral(): reverts when called by an account that is not the Active Pool
    StabilityPool
      ✔ offset(): reverts when called by an account that is not LiquidationHelper
    LUSDToken
      ✔ mint(): reverts when called by an account that is not BorrowerOperations
      ✔ burn(): reverts when called by an account that is not BO nor TroveM nor SP
      ✔ sendToPool(): reverts when called by an account that is not StabilityPool
      ✔ returnFromPool(): reverts when called by an account that is not TroveManager nor StabilityPool
      ✔ pauseMinting(): reverts when called by an account that is not Governance or Guardian
      ✔ unpauseMinting(): reverts when called by an account that is not Governance
      ✔ upgradeProtocol(): reverts when called by an account that is not Governance (254ms)
      ✔ updateGovernance: reverts when called by an account that is not Governance
      ✔ updateGuardian: reverts when called by an account that is not Governance
    SortedTroves
      ✔ insert(): reverts when called by an account that is not BorrowerOps or TroveM
      ✔ remove(): reverts when called by an account that is not TroveManager
      ✔ reinsert(): reverts when called by an account that is neither BorrowerOps nor TroveManager
    LQTYStaking
      ✔ increaseF_LUSD(): reverts when caller is neither TroveM nor RH
    CommunityIssuance
      ✔ sendOath(): reverts when caller is not the StabilityPool
      ✔ issueOath(): reverts when caller is not the StabilityPool

  Contract: BorrowerOperations
    Without proxy
      ✔ addColl(): reverts when top-up would leave trove with ICR < MCR (327ms)
      ✔ addColl(): Increases the activePool collateral balance by correct amount (207ms)
      ✔ addColl(), active Trove: adds the correct collateral amount to the Trove (198ms)
      ✔ addColl(), active Trove: Trove is in sortedList before and after (201ms)
      ✔ addColl(), active Trove: updates the stake and updates the total stakes (202ms)
      ✔ addColl(), active Trove: applies pending rewards and updates user's L_Collateral, L_LUSDDebt snapshots (646ms)
      ✔ addColl(), reverts if trove is non-existent or closed (429ms)
      ✔ addColl(): can add collateral in Recovery Mode (237ms)
      ✔ addColl(): can add collateral when minting is paused (208ms)
      ✔ addColl(): allowed even when protocol has been upgraded (618ms)
      ✔ withdrawColl(): reverts when withdrawal would leave trove with ICR < MCR (369ms)
      ✔ withdrawColl(): reverts when calling address does not have active trove (559ms)
      ✔ withdrawColl(): reverts when system is in Recovery Mode (607ms)
      ✔ withdrawColl(): reverts when requested collateral withdrawal is > the trove's collateral (704ms)
      ✔ withdrawColl(): reverts when withdrawal would bring the user's ICR < MCR (288ms)
      ✔ withdrawColl(): reverts if system is in Recovery Mode (575ms)
      ✔ withdrawColl(): doesn’t allow a user to completely withdraw all collateral from their Trove (due to gas compensation) (316ms)
      ✔ withdrawColl(): leaves the Trove active when the user withdraws less than all the collateral (182ms)
      ✔ withdrawColl(): reduces the Trove's collateral by the correct amount (183ms)
      ✔ withdrawColl(): reduces ActivePool ETH and raw ether by correct amount (193ms)
      ✔ withdrawColl(): updates the stake and updates the total stakes (198ms)
      ✔ withdrawColl(): sends the correct amount of collateral to the user (194ms)
      ✔ withdrawColl(): applies pending rewards and updates user's L_Collateral, L_LUSDDebt snapshots (728ms)
      ✔ withdrawColl(): can withdraw collateral when minting is paused (180ms)
      ✔ withdrawColl(): allowed even when protocol has been upgraded (861ms)
      ✔ withdrawLUSD(): reverts when withdrawal would leave trove with ICR < MCR (442ms)
      ✔ withdrawLUSD(): decays a non-zero base rate (685ms)
      ✔ withdrawLUSD(): reverts if max fee > 100% (1377ms)
      ✔ withdrawLUSD(): reverts if max fee < 0.5% in Normal mode (1082ms)
      ✔ withdrawLUSD(): reverts if fee exceeds max fee percentage (1326ms)
      ✔ withdrawLUSD(): succeeds when fee is less than max fee percentage (1266ms)
      ✔ withdrawLUSD(): doesn't change base rate if it is already zero (781ms)
      ✔ withdrawLUSD(): lastFeeOpTime doesn't update if less time than decay interval has passed since the last fee operation (614ms)
      ✔ withdrawLUSD(): borrower can't grief the baseRate and stop it decaying by issuing debt at higher frequency than the decay granularity (961ms)
      ✔ withdrawLUSD(): borrowing at non-zero base rate sends LUSD fee to LQTY staking contract (649ms)
      ✔ withdrawLUSD(): borrowing at non-zero base records the (drawn debt + fee) on the Trove struct (614ms)
      ✔ withdrawLUSD(): Borrowing at non-zero base rate increases the LQTY staking contract LUSD fees-per-unit-staked (1012ms)
      ✔ withdrawLUSD(): Borrowing at non-zero base rate sends requested amount to the user (649ms)
      ✔ withdrawLUSD(): Borrowing at zero base rate changes LUSD fees-per-unit-staked (639ms)
      ✔ withdrawLUSD(): Borrowing at zero base rate sends debt request to user (622ms)
      ✔ withdrawLUSD(): reverts when calling address does not have active trove (940ms)
      ✔ withdrawLUSD(): reverts when requested withdrawal amount is zero LUSD (547ms)
      ✔ withdrawLUSD(): reverts when system is in Recovery Mode (1685ms)
      ✔ withdrawLUSD(): reverts when withdrawal would bring the trove's ICR < MCR (500ms)
      ✔ withdrawLUSD(): reverts when a withdrawal would cause the TCR of the system to fall below the CCR (585ms)
      ✔ withdrawLUSD(): reverts if system is in Recovery Mode (546ms)
      ✔ withdrawLUSD(): increases the Trove's LUSD debt by the correct amount (206ms)
      ✔ withdrawLUSD(): increases LUSD debt in ActivePool by correct amount (200ms)
      ✔ withdrawLUSD(): increases user LUSDToken balance by correct amount (190ms)
      ✔ withdrawLUSD(): reverts when minting is paused (323ms)
      ✔ withdrawLUSD(): disallowed once protocol has been upgraded (1028ms)
      ✔ repayLUSD(): reverts when repayment would leave trove with ICR < MCR (582ms)
      ✔ repayLUSD(): Succeeds when it would leave trove with net debt >= minimum net debt (308ms)
      ✔ repayLUSD(): reverts when it would leave trove with net debt < minimum net debt (325ms)
      ✔ adjustTrove(): Reverts if repaid amount is greater than current debt (599ms)
      ✔ repayLUSD(): reverts when calling address does not have active trove (522ms)
      ✔ repayLUSD(): reverts when attempted repayment is > the debt of the trove (1152ms)
      ✔ repayLUSD(): reduces the Trove's LUSD debt by the correct amount (289ms)
      ✔ repayLUSD(): decreases LUSD debt in ActivePool by correct amount (289ms)
      ✔ repayLUSD(): decreases user LUSDToken balance by correct amount (280ms)
      ✔ repayLUSD(): can repay debt in Recovery Mode (303ms)
      ✔ repayLUSD(): Reverts if borrower has insufficient LUSD balance to cover his debt repayment (795ms)
      ✔ repayLUSD(): can repay debt when minting is paused (192ms)
      ✔ repayLUSD(): allowed even when protocol has been upgraded (549ms)
      ✔ adjustTrove(): reverts when adjustment would leave trove with ICR < MCR (401ms)
      ✔ adjustTrove(): reverts if max fee < 0.5% in Normal mode (779ms)
      ✔ adjustTrove(): allows max fee < 0.5% in Recovery mode (503ms)
      ✔ adjustTrove(): decays a non-zero base rate (781ms)
      ✔ adjustTrove(): doesn't decay a non-zero base rate when user issues 0 debt (1034ms)
      ✔ adjustTrove(): doesn't change base rate if it is already zero (377ms)
      ✔ adjustTrove(): lastFeeOpTime doesn't update if less time than decay interval has passed since the last fee operation (607ms)
      ✔ adjustTrove(): borrower can't grief the baseRate and stop it decaying by issuing debt at higher frequency than the decay granularity (598ms)
      ✔ adjustTrove(): borrowing at non-zero base rate sends LUSD fee to LQTY staking contract (569ms)
      ✔ adjustTrove(): borrowing at non-zero base records the (drawn debt + fee) on the Trove struct (652ms)
      ✔ adjustTrove(): Borrowing at non-zero base rate increases the LQTY staking contract LUSD fees-per-unit-staked (1082ms)
      ✔ adjustTrove(): Borrowing at non-zero base rate sends requested amount to the user (661ms)
      ✔ adjustTrove(): Borrowing at zero base rate changes LUSD balance of LQTY staking contract (624ms)
      ✔ adjustTrove(): Borrowing at zero base rate changes LQTY staking contract LUSD fees-per-unit-staked (669ms)
      ✔ adjustTrove(): Borrowing at zero base rate sends total requested LUSD to the user (622ms)
      ✔ adjustTrove(): reverts when calling address has no active trove (510ms)
      ✔ adjustTrove(): reverts in Recovery Mode when the adjustment would reduce the TCR (1136ms)
      ✔ adjustTrove(): collateral withdrawal reverts in Recovery Mode (784ms)
      ✔ adjustTrove(): debt increase that would leave ICR < 150% reverts in Recovery Mode (444ms)
      ✔ adjustTrove(): debt increase that would reduce the ICR reverts in Recovery Mode (812ms)
      ✔ adjustTrove(): A trove with ICR < CCR in Recovery Mode can adjust their trove to ICR > CCR (332ms)
      ✔ adjustTrove(): A trove with ICR > CCR in Recovery Mode can improve their ICR (344ms)
      ✔ adjustTrove(): debt increase in Recovery Mode charges no fee (366ms)
      ✔ adjustTrove(): reverts when change would cause the TCR of the system to fall below the CCR (438ms)
      ✔ adjustTrove(): reverts when LUSD repaid is > debt of the trove (857ms)
      ✔ adjustTrove(): reverts when attempted collateral withdrawal is >= the trove's collateral (643ms)
      ✔ adjustTrove(): reverts when change would cause the ICR of the trove to fall below the MCR (731ms)
      ✔ adjustTrove(): With 0 coll change, doesnt change borrower's coll or ActivePool coll (200ms)
      ✔ adjustTrove(): With 0 debt change, doesnt change borrower's debt or ActivePool debt (209ms)
      ✔ adjustTrove(): updates borrower's debt and coll with an increase in both (321ms)
      ✔ adjustTrove(): updates borrower's debt and coll with a decrease in both (296ms)
      ✔ adjustTrove(): updates borrower's  debt and coll with coll increase, debt decrease (307ms)
      ✔ adjustTrove(): updates borrower's debt and coll with coll decrease, debt increase (304ms)
      ✔ adjustTrove(): updates borrower's stake and totalStakes with a coll increase (312ms)
      ✔ adjustTrove(): updates borrower's stake and totalStakes with a coll decrease (743ms)
      ✔ adjustTrove(): changes LUSDToken balance by the requested decrease (283ms)
      ✔ adjustTrove(): changes LUSDToken balance by the requested increase (312ms)
      ✔ adjustTrove(): Changes the activePool collateral balance by the requested decrease (289ms)
      ✔ adjustTrove(): Changes the activePool collateral balance by the amount of collateral sent (319ms)
      ✔ adjustTrove(): Changes the LUSD debt in ActivePool by requested decrease (302ms)
      ✔ adjustTrove(): Changes the LUSD debt in ActivePool by requested increase (321ms)
      ✔ adjustTrove(): new coll = 0 and new debt = 0 is not allowed, as gas compensation still counts toward ICR (442ms)
      ✔ adjustTrove(): Reverts if requested debt increase and amount is zero (416ms)
      ✔ adjustTrove(): Reverts if requested coll withdrawal and ether is sent (572ms)
      ✔ adjustTrove(): Reverts if it’s zero adjustment (259ms)
      ✔ adjustTrove(): Reverts if requested coll withdrawal is greater than trove's collateral (589ms)
      ✔ adjustTrove(): Reverts if borrower has insufficient LUSD balance to cover his debt repayment (554ms)
      ✔ Internal _adjustTrove(): reverts when op is a withdrawal and _borrower param is not the msg.sender (807ms)
      ✔ closeTrove(): reverts when it would lower the TCR below CCR (461ms)
      ✔ closeTrove(): reverts when calling address does not have active trove (755ms)
      ✔ closeTrove(): reverts when system is in Recovery Mode (973ms)
      ✔ closeTrove(): reverts when trove is the only one in the system (282ms)
      ✔ closeTrove(): reduces a Trove's collateral to zero (286ms)
      ✔ closeTrove(): reduces a Trove's debt to zero (295ms)
      ✔ closeTrove(): sets Trove's stake to zero (289ms)
      ✔ closeTrove(): zero's the troves reward snapshots (730ms)
      ✔ closeTrove(): sets trove's status to closed and removes it from sorted troves list (291ms)
      ✔ closeTrove(): reduces ActivePool collateral by correct amount (303ms)
      ✔ closeTrove(): reduces ActivePool debt by correct amount (300ms)
      ✔ closeTrove(): updates the total stakes (400ms)
      ✔ closeTrove(): sends the correct amount of collateral to the user (289ms)
      ✔ closeTrove(): subtracts the debt of the closed Trove from the Borrower's LUSDToken balance (297ms)
      ✔ closeTrove(): applies pending rewards (938ms)
      ✔ closeTrove(): reverts if borrower has insufficient LUSD balance to repay his entire debt (351ms)
      ✔ closeTrove(): allowed when minting is paused (670ms)
      ✔ closeTrove(): allowed even when protocol has been upgraded (562ms)
      ✔ openTrove(): emits a TroveUpdated event with the correct collateral and debt (570ms)
      ✔ openTrove(): Opens a trove with net debt >= minimum net debt (215ms)
      ✔ openTrove(): reverts if net debt < minimum net debt (756ms)
      ✔ openTrove(): decays a non-zero base rate (1238ms)
      ✔ openTrove(): doesn't change base rate if it is already zero (675ms)
      ✔ openTrove(): lastFeeOpTime doesn't update if less time than decay interval has passed since the last fee operation (668ms)
      ✔ openTrove(): reverts if max fee > 100% (98ms)
      ✔ openTrove(): reverts if max fee < 0.5% in Normal mode (1425ms)
      ✔ openTrove(): allows max fee < 0.5% in Recovery Mode (363ms)
      ✔ openTrove(): reverts if fee exceeds max fee percentage (1069ms)
      ✔ openTrove(): succeeds when fee is less than max fee percentage (806ms)
      ✔ openTrove(): borrower can't grief the baseRate and stop it decaying by issuing debt at higher frequency than the decay granularity (675ms)
      ✔ openTrove(): borrowing at non-zero base rate sends LUSD fee to LQTY staking contract (585ms)
      ✔ openTrove(): borrowing at non-zero base records the (drawn debt + fee  + liq. reserve) on the Trove struct (585ms)
      ✔ openTrove(): Borrowing at non-zero base rate increases the LQTY staking contract LUSD fees-per-unit-staked (584ms)
      ✔ openTrove(): Borrowing at non-zero base rate sends requested amount to the user (565ms)
      ✔ openTrove(): Borrowing at zero base rate changes the LQTY staking contract LUSD fees-per-unit-staked (463ms)
      ✔ openTrove(): Borrowing at zero base rate charges minimum fee (895ms)
      ✔ openTrove(): reverts when system is in Recovery Mode and ICR < CCR (480ms)
      ✔ openTrove(): reverts when trove ICR < MCR (904ms)
      ✔ openTrove(): reverts when opening the trove would cause the TCR of the system to fall below the CCR (389ms)
      ✔ openTrove(): reverts if trove is already active (1134ms)
      ✔ openTrove(): Can open a trove with ICR >= CCR when system is in Recovery Mode (356ms)
      ✔ openTrove(): Reverts opening a trove with min debt when system is in Recovery Mode (446ms)
      ✔ openTrove(): creates a new Trove and assigns the correct collateral and debt amount (119ms)
      ✔ openTrove(): adds Trove owner to TroveOwners array (129ms)
      ✔ openTrove(): creates a stake and adds it to total stakes (136ms)
      ✔ openTrove(): inserts Trove to Sorted Troves list (133ms)
      ✔ openTrove(): Increases the activePool collateral balance by correct amount (139ms)
      ✔ openTrove(): records up-to-date initial snapshots of L_Collateral and L_LUSDDebt (423ms)
      ✔ openTrove(): allows a user to open a Trove, then close it, then re-open it (488ms)
      ✔ openTrove(): increases the Trove's LUSD debt by the correct amount (122ms)
      ✔ openTrove(): increases LUSD debt in ActivePool by the debt of the trove (135ms)
      ✔ openTrove(): increases user LUSDToken balance by correct amount (107ms)
      ✔ openTrove(): not allowed when minting is paused (438ms)
      ✔ openTrove(): not allowed when protocol has been upgraded (848ms)
      ✔ getCompositeDebt(): returns debt + gas comp
      getNewICRFromTroveChange() returns the correct ICR
        ✔ collChange = 0, debtChange = 0
        ✔ collChange = 0, debtChange is positive
        ✔ collChange = 0, debtChange is negative (328ms)
        ✔ collChange is positive, debtChange is 0
        ✔ collChange is negative, debtChange is 0
        ✔ collChange is negative, debtChange is negative
        ✔ collChange is positive, debtChange is positive
        ✔ collChange is positive, debtChange is negative
        ✔ collChange is negative, debtChange is positive
      getNewTCRFromTroveChange() returns the correct TCR
        ✔ collChange = 0, debtChange = 0 (404ms)
        ✔ collChange = 0, debtChange is positive (370ms)
        ✔ collChange = 0, debtChange is negative (318ms)
        ✔ collChange is positive, debtChange is 0 (324ms)
        ✔ collChange is negative, debtChange is 0 (329ms)
        ✔ collChange is negative, debtChange is negative (328ms)
        ✔ collChange is positive, debtChange is positive (324ms)
        ✔ collChange is positive, debtChange is negative (320ms)
        ✔ collChange is negative, debtChange is positive (326ms)

  Contract: CollSurplusPool
    ✔ CollSurplusPool::getCollateral(): Returns the collateral balance of the CollSurplusPool after redemption (569ms)
    ✔ CollSurplusPool: claimColl(): Reverts if caller is not Borrower Operations
    ✔ CollSurplusPool: claimColl(): Reverts if nothing to claim (175ms)
    ✔ CollSurplusPool: reverts trying to pull collateral from ActivePool if caller not ActivePool
    ✔ CollSurplusPool: accountSurplus: reverts if caller is not Trove Manager (902ms)

  Contract: CollateralConfig
    ✔ sets the right values on initializing (117ms)
    ✔ can be initialized only once (371ms)
    ✔ owner can update CRs but only by lowering them (146ms)
    ✔ debt limit is enforced (626ms)
    ✔ cannot add existing collateral (97ms)

  Contract: Deployment script - Sets correct contract addresses dependencies after deployment
    ✔ Sets the correct PriceFeed address in TroveManager
    ✔ Sets the correct LUSDToken address in TroveManager
    ✔ Sets the correct SortedTroves address in TroveManager
    ✔ Sets the correct BorrowerOperations address in TroveManager
    ✔ Sets the correct ActivePool address in TroveManager
    ✔ Sets the correct DefaultPool address in TroveManager
    ✔ Sets the correct StabilityPool address in LiquidationHelper
    ✔ Sets the correct LQTYStaking address in TroveManager
    ✔ Sets the correct CollateralConfig address in TroveManager
    ✔ Sets the correct RedemptionHelper address in TroveManager
    ✔ Sets the correct LiquidationHelper address in TroveManager
    ✔ Sets the correct StabilityPool address in ActivePool
    ✔ Sets the correct DefaultPool address in ActivePool
    ✔ Sets the correct BorrowerOperations address in ActivePool
    ✔ Sets the correct TroveManager address in ActivePool
    ✔ Sets the correct CollateralConfig address in ActivePool
    ✔ Sets the correct RedemptionHelper address in ActivePool
    ✔ Sets the correct LiquidationHelper address in ActivePool
    ✔ Sets the correct ActivePool address in StabilityPool
    ✔ Sets the correct BorrowerOperations address in StabilityPool
    ✔ Sets the correct LUSDToken address in StabilityPool
    ✔ Sets the correct TroveManager address in StabilityPool
    ✔ Sets the correct CollateralConfig address in StabilityPool
    ✔ Sets the correct TroveManager address in DefaultPool
    ✔ Sets the correct ActivePool address in DefaultPool
    ✔ Sets the correct CollateralConfig address in DefaultPool
    ✔ Sets the correct TroveManager address in SortedTroves
    ✔ Sets the correct BorrowerOperations address in SortedTroves
    ✔ Sets the correct TroveManager address in BorrowerOperations
    ✔ Sets the correct PriceFeed address in BorrowerOperations
    ✔ Sets the correct SortedTroves address in BorrowerOperations
    ✔ Sets the correct ActivePool address in BorrowerOperations
    ✔ Sets the correct DefaultPool address in BorrowerOperations
    ✔ Sets the correct LQTYStaking address in BorrowerOperations
    ✔ Sets the correct CollateralConfig address in BorrowerOperations
    ✔ Sets the correct LQTYToken address in LQTYStaking
    ✔ Sets the correct ActivePool address in LQTYStaking
    ✔ Sets the correct ActivePool address in LQTYStaking
    ✔ Sets the correct ActivePool address in LQTYStaking
    ✔ Sets the correct BorrowerOperations address in LQTYStaking
    ✔ Sets the correct CollateralConfig address in LQTYStaking
    ✔ Sets the correct LQTYToken address in CommunityIssuance
    ✔ Sets the correct StabilityPool address in CommunityIssuance

  Contract: DefaultPool
    ✔ sendCollateralToActivePool(): fails if caller is not TroveManager (123ms)

  Contract: Fee arithmetic tests
    ✔ minutesPassedSinceLastFeeOp(): returns minutes passed for no time increase
    ✔ minutesPassedSinceLastFeeOp(): returns minutes passed between time of last fee operation and current block.timestamp, rounded down to nearest minutes (269ms)
    ✔ decayBaseRateFromBorrowing(): returns the initial base rate for no time increase
    ✔ decayBaseRateFromBorrowing(): returns the initial base rate for less than one minute passed  (58ms)
    ✔ decayBaseRateFromBorrowing(): returns correctly decayed base rate, for various durations. Initial baseRate = 0.01 (955ms)
    ✔ decayBaseRateFromBorrowing(): returns correctly decayed base rate, for various durations. Initial baseRate = 0.1 (1057ms)
    ✔ decayBaseRateFromBorrowing(): returns correctly decayed base rate, for various durations. Initial baseRate = 0.34539284 (1078ms)
    ✔ decayBaseRateFromBorrowing(): returns correctly decayed base rate, for various durations. Initial baseRate = 0.9976 (974ms)
    Basic exponentiation
      ✔ decPow(): for exponent = 0, returns 1, regardless of base (45ms)
      ✔ decPow(): for exponent = 1, returns base, regardless of base
      ✔ decPow(): for base = 0, returns 0 for any exponent other than 0 (83ms)
      ✔ decPow(): for base = 1, returns 1 for any exponent (87ms)
      ✔ decPow(): for exponent = 2, returns the square of the base
      ✔ decPow(): correct output for various bases and exponents (199ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = 7776000 (seconds in three months) (3342ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = 2592000 (seconds in one month) (3153ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = 43200 (minutes in one month) (1885ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = 525600 (minutes in one year) (2092ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = 2628000 (minutes in five years) (2450ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = minutes in ten years (3236ms)
      ✔ decPow(): abs. error < 1e-9 for exponent = minutes in one hundred years (2595ms)
      - decPow(): overflow test: doesn't overflow for exponent = minutes in 1000 years

  Contract: Gas compensation tests
    ✔ _getCollGasCompensation(): returns the 0.5% of collaterall if it is < $10 in value
    ✔ _getCollGasCompensation(): returns 0.5% of collaterall when 0.5% of collateral < $10 in value
    ✔ getCollGasCompensation(): returns 0.5% of collaterall when 0.5% of collateral = $10 in value
    ✔ getCollGasCompensation(): returns 0.5% of collaterall when 0.5% of collateral = $10 in value
    ✔ _getCompositeDebt(): returns (debt + 10) when collateral < $10 in value
    ✔ getCompositeDebt(): returns (debt + 10) collateral = $10 in value
    ✔ getCompositeDebt(): returns (debt + 10) when 0.5% of collateral > $10 in value
    ✔ getCurrentICR(): Incorporates virtual debt, and returns the correct ICR for new troves (1667ms)
    ✔ Gas compensation from pool-offset liquidations. All collateral paid as compensation (1082ms)
    ✔ gas compensation from pool-offset liquidations: 0.5% collateral < $10 in value. Compensates $10 worth of collateral, liquidates the remainder (972ms)
    ✔ gas compensation from pool-offset liquidations: 0.5% collateral > $10 in value. Compensates 0.5% of  collateral, liquidates the remainder (959ms)
    ✔ Gas compensation from pool-offset liquidations. Liquidation event emits the correct gas compensation and total liquidated coll and debt (943ms)
1505000000000
199999000000000000000
12
    ✔ gas compensation from pool-offset liquidations. Liquidation event emits the correct gas compensation and total liquidated coll and debt (1685ms)
    ✔ gas compensation from pool-offset liquidations: 0.5% collateral > $10 in value. Liquidation event emits the correct gas compensation and total liquidated coll and debt (941ms)
    ✔ liquidateTroves(): full offset.  Compensates the correct amount, and liquidates the remainder (1113ms)
    ✔ liquidateTroves(): full redistribution. Compensates the correct amount, and liquidates the remainder (1562ms)
    ✔ liquidateTroves(): full offset. Liquidation event emits the correct gas compensation and total liquidated coll and debt (1066ms)
    ✔ liquidateTroves(): full redistribution. Liquidation event emits the correct gas compensation and total liquidated coll and debt (1046ms)
    ✔ Trove ordering: same collateral, decreasing debt. Price successively increases. Troves should maintain ordering by ICR (1887ms)
    ✔ Trove ordering: increasing collateral, constant debt. Price successively increases. Troves should maintain ordering by ICR (2251ms)
    ✔ Trove ordering: Constant raw collateral ratio (excluding virtual debt). Price successively increases. Troves should maintain ordering by ICR (2501ms)

  Contract: HintHelpers
    ✔ setup: makes accounts with nominal ICRs increasing by 1% consecutively (47ms)
    ✔ getApproxHint(): returns the address of a Trove within sqrt(length) positions of the correct insert position (713ms)
    ✔ getApproxHint(): returns the head of the list if the CR is the max uint256 value (189ms)
    ✔ getApproxHint(): returns the tail of the list if the CR is lower than ICR of any Trove (195ms)
    ✔ computeNominalCR()

  Contract: Oath community issuance tests
    ✔ fund(): Oath shows up at the contract address
    ✔ fund(): Oath is deducted from caller balance (41ms)
    ✔ fund(): cannot fund 0 (420ms)
    ✔ fund(): Updates last distribution time to distributionPeriod days after call (49ms)
    ✔ fund(): Updates rewards per second to the proper amount
    ✔ fund(): Can only be called by owner (143ms)
    ✔ updateDistributionPeriod(): Can only be called by owner (244ms)
    ✔ Issues a set amount of rewards per second
    ✔ issues 0 when funds have been fully issued
    ✔ issues 0 when the contract hasn't been funded
    ✔ cannot set addresses more than once (210ms)
    ✔ has the proper owner
    ✔ aggregates multiple funding rounds within a distribution period
    ✔ only adds OATH sent through fund() to the distribution
    ✔ rewards the proper amount each day (167ms)
    ✔ rewards the proper amount each day, with varying distributions (401ms)
    ✔ adjusts unissued OATH properly when new funding arrives (54ms)

  Contract: LQTYStaking revenue share tests
    ✔ stake(): reverts if amount is zero (529ms)
    ✔ ETH fee per LQTY staked increases when a redemption fee is triggered and totalStakes > 0 (835ms)
    ✔ ETH fee per LQTY staked doesn't change when a redemption fee is triggered and totalStakes == 0 (950ms)
    ✔ LUSD fee per LQTY staked increases when a redemption fee is triggered and totalStakes > 0 (1060ms)
    ✔ LUSD fee per LQTY staked doesn't change when a redemption fee is triggered and totalStakes == 0 (1043ms)
    ✔ LQTY Staking: A single staker earns all collateral and LUSD fees that occur (2268ms)
    ✔ stake(): Top-up sends out all accumulated collateral and LUSD gains to the staker (1496ms)
    ✔ getPendingCollateralGain(): Returns the staker's correct pending collateral gain (1295ms)
    ✔ getPendingLUSDGain(): Returns the staker's correct pending LUSD gain (1450ms)
    ✔ LQTY Staking: Multiple stakers earn the correct share of all ETH and LQTY fees, based on their stake size (3249ms)
    ✔ receive(): reverts when it receives native ETH from an address
    ✔ unstake(): reverts if user has no stake (297ms)
    ✔ Test requireCallerIsTroveManager

  Contract: LUSDToken
    Basic token functions, without Proxy
      ✔ balanceOf(): gets the balance of the account
      ✔ totalSupply(): gets the total supply
      ✔ name(): returns the token's name
      ✔ symbol(): returns the token's symbol
      ✔ decimal(): returns the number of decimal digits used
      ✔ allowance(): returns an account's spending allowance for another account's balance
      ✔ approve(): approves an account to spend the specified amount
      ✔ approve(): reverts when spender param is address(0) (128ms)
      ✔ approve(): reverts when owner param is address(0) (322ms)
      ✔ transferFrom(): successfully transfers from an account which is it approved to transfer from (178ms)
      ✔ transfer(): increases the recipient's balance by the correct amount
      ✔ transfer(): reverts if amount exceeds sender's balance (245ms)
      ✔ transfer(): transferring to a blacklisted address reverts (456ms)
      ✔ increaseAllowance(): increases an account's allowance by the correct amount
      ✔ mint(): issues correct amount of tokens to the given address
      ✔ burn(): burns correct amount of tokens from the given address
      ✔ sendToPool(): changes balances of Stability pool and user by the correct amounts
      ✔ returnFromPool(): changes balances of Stability pool and user by the correct amounts
      ✔ transfer(): transferring to a blacklisted address reverts (706ms)
      ✔ decreaseAllowance(): decreases allowance by the expected amount
      ✔ decreaseAllowance(): fails trying to decrease more than previously allowed (378ms)
      ✔ version(): returns the token contract's version
      ✔ Initializes PERMIT_TYPEHASH correctly
      ✔ Initializes DOMAIN_SEPARATOR correctly
      ✔ Initial nonce for a given address is 0
      ✔ permits and emits an Approval event (replay protected) (185ms)
      ✔ permits(): fails with expired deadline (497ms)
      ✔ permits(): fails with the wrong signature (158ms)
    Basic token functions, with Proxy
      ✔ balanceOf(): gets the balance of the account
      ✔ totalSupply(): gets the total supply
      ✔ name(): returns the token's name
      ✔ symbol(): returns the token's symbol
      ✔ decimal(): returns the number of decimal digits used
      ✔ allowance(): returns an account's spending allowance for another account's balance
      ✔ approve(): approves an account to spend the specified amount
      ✔ transferFrom(): successfully transfers from an account which is it approved to transfer from (267ms)
      ✔ transfer(): increases the recipient's balance by the correct amount
      ✔ transfer(): reverts if amount exceeds sender's balance (177ms)
      ✔ transfer(): transferring to a blacklisted address reverts (1789ms)
      ✔ increaseAllowance(): increases an account's allowance by the correct amount
      ✔ transfer(): transferring to a blacklisted address reverts (525ms)
      ✔ decreaseAllowance(): decreases allowance by the expected amount
      ✔ decreaseAllowance(): fails trying to decrease more than previously allowed (196ms)

  Contract: Leverager
    - Levers up with 1 iteration
    - Levers up with 2 iterations
    - Delevers and closes from 1.3 CR max leverage
    - Reverts with too many iterations

  Contract: LiquityMath
    ✔ max works if a > b
    ✔ max works if a = b
    ✔ max works if a < b

  Contract: LiquitySafeMath128Tester
    ✔ add(): reverts if overflows
    ✔ sub(): reverts if underflows

  Contract: All Liquity functions with onlyOwner modifier
    TroveManager
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (2210ms)
    BorrowerOperations
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (280ms)
    DefaultPool
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (327ms)
    StabilityPool
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (370ms)
    ActivePool
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (145ms)
    SortedTroves
      ✔ setParams(): reverts when called by non-owner, with wrong addresses, or twice (86ms)
    CommunityIssuance
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (185ms)
    LQTYStaking
      ✔ setAddresses(): reverts when called by non-owner, with wrong addresses, or twice (144ms)

  Contract: StabilityPool
    ✔ getCollateral(): gets the recorded collateral balance
    ✔ getTotalLUSDDeposits(): gets the recorded LUSD balance

  Contract: ActivePool
    ✔ getCollateral(): gets the recorded Collateral balance
    ✔ getLUSDDebt(): gets the recorded LUSD balance
    ✔ increaseLUSD(): increases the recorded LUSD balance by the correct amount
    ✔ decreaseLUSD(): decreases the recorded LUSD balance by the correct amount
    ✔ sendCollateral(): decreases the recorded collateral balance by the correct amount (46ms)
    ✔ vault addresses are set correctly
    ✔ default yielding percentages are 0
    ✔ default yielding amounts are 0
    ✔ default yield claim thresholds are 0
    ✔ default yield percentage drift is 1%
    ✔ sendCollateral works with default values, vault share bal is 0 before and after (47ms)
    ✔ pullCollateral works with default values, vault share bal is 0 before and after (52ms)
    ✔ manualRebalance works with default values, vault share bal is 0 before and after (49ms)
    ✔ non-owner cannot update yielding percentage for any collateral
    ✔ owner cannot set yielding percentage for any collateral > 10k
    ✔ only owner can set yielding percentage for any collateral <= 10k
    ✔ non-owner cannot update yielding percentage drift
    ✔ owner cannot set yielding percentage drift > 500
    ✔ only owner can set yielding percentage drift <= 500
    ✔ non-owner cannot update yield claim threshold for any collateral
    ✔ only owner can set yield claim threshold for any collateral
    ✔ non-owner cannot call manualRebalance
    ✔ only owner can call manualRebalance
    ✔ reasonableDefaultState: verify yielding amounts + vault share balances are correct (65ms)
    ✔ simulate profit, check that send collateral distributes profit (82ms)
    ✔ simulate profit and increase yielding percentage, check that send collateral distributes profit (89ms)
    ✔ simulate profit and reduce yielding percentage, check that send collateral distributes profit (117ms)
    ✔ simulate loss, check that send collateral reverts (100ms)
    ✔ simulate profit, check that pull collateral distributes profit (94ms)
    ✔ simulate profit and increase yielding percentage, check that pull collateral distributes profit (94ms)
    ✔ simulate profit and reduce yielding percentage, check that pull collateral distributes profit (142ms)
    ✔ simulate loss, check that pull collateral reverts (124ms)
    ✔ simulate profit, check that manual rebalance distributes profit (131ms)
    ✔ simulate profit, update treasury (219ms)
    ✔ simulate profit and increase yielding percentage, check that manual rebalance distributes profit (136ms)
    ✔ simulate profit and reduce yielding percentage, check that manual rebalance distributes profit (148ms)
    ✔ simulate loss, check that manual rebalance reverts (128ms)

  Contract: DefaultPool
    ✔ getCollateral(): gets the recorded collateral balance
    ✔ getLUSDDebt(): gets the recorded LUSD balance
    ✔ increaseLUSD(): increases the recorded LUSD balance by the correct amount
    ✔ decreaseLUSD(): decreases the recorded LUSD balance by the correct amount

  Contract: PriceFeed
    ✔ C1 Chainlink working: fetchPrice should return the correct price, taking into account the number of decimal digits on the aggregator (141ms)
    ✔ C1 Chainlink breaks, Tellor working: fetchPrice should return the correct Tellor price, taking into account Tellor's 18-digit granularity (162ms)
    ✔ C1 Chainlink breaks, Tellor working: fetchPrice should return the correct Tellor price, taking into account TellorCaller's last saved timestamp (141ms)
    ✔ C1 chainlinkWorking: Chainlink broken by zero latest roundId, Tellor working: switch to usingChainlinkTellorUntrusted (88ms)
    ✔ C1 chainlinkWorking: Chainlink broken by zero latest roundId, Tellor working: use Tellor price (58ms)
    ✔ C1 chainlinkWorking: Chainlink broken by zero timestamp, Tellor working, switch to usingChainlinkTellorUntrusted (57ms)
    ✔ C1 chainlinkWorking:  Chainlink broken by zero timestamp, Tellor working, return Tellor price (60ms)
    ✔ C1 chainlinkWorking: Chainlink broken by future timestamp, Tellor working, switch to usingChainlinkTellorUntrusted (325ms)
    ✔ C1 chainlinkWorking: Chainlink broken by future timestamp, Tellor working, return Tellor price (59ms)
    ✔ C1 chainlinkWorking: Chainlink broken by negative price, Tellor working,  switch to usingChainlinkTellorUntrusted (57ms)
    ✔ C1 chainlinkWorking: Chainlink broken by negative price, Tellor working, return Tellor price (54ms)
    ✔ C1 chainlinkWorking: Chainlink broken - decimals call reverted, Tellor working, switch to usingChainlinkTellorUntrusted (56ms)
    ✔ C1 chainlinkWorking: Chainlink broken - decimals call reverted, Tellor working, return Tellor price (56ms)
    ✔ C1 chainlinkWorking: Chainlink broken - latest round call reverted, Tellor working, switch to usingChainlinkTellorUntrusted (58ms)
    ✔ C1 chainlinkWorking: latest round call reverted, Tellor working, return the Tellor price (56ms)
    ✔ C1 chainlinkWorking: previous round call reverted, Tellor working, switch to usingChainlinkTellorUntrusted (57ms)
    ✔ C1 chainlinkWorking: previous round call reverted, Tellor working, return Tellor Price (57ms)
    ✔ C1 chainlinkWorking: Chainlink frozen, Tellor working: switch to usingTellorChainlinkFrozen (62ms)
    ✔ C1 chainlinkWorking: Chainlink frozen, Tellor working: return Tellor price (61ms)
    ✔ C1 chainlinkWorking: Chainlink frozen, Tellor frozen: switch to usingTellorChainlinkFrozen (63ms)
    ✔ C1 chainlinkWorking: Chainlink frozen, Tellor frozen: return last good price (60ms)
    ✔ C1 chainlinkWorking: Chainlink times out, Tellor broken by 0 price: switch to usingChainlinkTellorUntrusted (52ms)
    ✔ C1 chainlinkWorking: Chainlink times out, Tellor broken by 0 price: return last good price (54ms)
    ✔ C1 chainlinkWorking: Chainlink is out of date by <3hrs: remain chainlinkWorking (48ms)
    ✔ C1 chainlinkWorking: Chainlink is out of date by <3hrs: return Chainklink price (51ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50%, switch to usingChainlinkTellorUntrusted (56ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50%, return the Tellor price (56ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of 50%, remain chainlinkWorking (55ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of 50%, return the Chainlink price (55ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of <50%, remain chainlinkWorking (57ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of <50%, return Chainlink price (53ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of >100%, switch to usingChainlinkTellorUntrusted (55ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of >100%, return Tellor price (60ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of 100%, remain chainlinkWorking (58ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of 100%, return Chainlink price (54ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of <100%, remain chainlinkWorking (54ms)
    ✔ C1 chainlinkWorking: Chainlink price increase of <100%,  return Chainlink price (57ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor price matches: remain chainlinkWorking (57ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor price matches: return Chainlink price (55ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor price within 5% of Chainlink: remain chainlinkWorking (55ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor price within 5% of Chainlink: return Chainlink price (55ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor live but not within 5% of Chainlink: switch to usingChainlinkTellorUntrusted (57ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor live but not within 5% of Chainlink: return Tellor price (58ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor frozen: switch to usingChainlinkTellorUntrusted (60ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor frozen: return last good price (64ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by 0 price: switch to bothOracleSuspect (50ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by 0 price: return last good price (59ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by 0 timestamp: switch to bothOracleSuspect (51ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by invalid timestamp: switch to bothOracleSuspect (50ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by 0 timestamp: return last good price (57ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by future timestamp: Pricefeed switches to bothOracleSuspect (50ms)
    ✔ C1 chainlinkWorking: Chainlink price drop of >50% and Tellor is broken by future timestamp: return last good price (59ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor is working - remain on chainlinkWorking (57ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor is working - return Chainlink price (59ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor freezes - remain on chainlinkWorking (72ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor freezes - return Chainlink price (64ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor breaks: switch to usingChainlinkTellorUntrusted (53ms)
    ✔ C1 chainlinkWorking: Chainlink is working and Tellor breaks: return Chainlink price (54ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by zero price: switch to bothOraclesSuspect (55ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by zero price: return last good price (57ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by call reverted: switch to bothOraclesSuspect (229ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by call reverted: return last good price (54ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by zero timestamp: switch to bothOraclesSuspect (55ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor breaks by zero timestamp: return last good price (59ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor freezes - remain usingChainlinkTellorUntrusted (63ms)
    ✔ C2 usingTellorChainlinkUntrusted: Tellor freezes - return last good price (62ms)
    ✔ C2 usingTellorChainlinkUntrusted: both Tellor and Chainlink are live and <= 5% price difference - switch to chainlinkWorking (48ms)
    ✔ C2 usingTellorChainlinkUntrusted: chainlink aggregator address upgraded - switch to chainlinkWorking (364ms)
    ✔ C2 usingTellorChainlinkUntrusted: both Tellor and Chainlink are live and <= 5% price difference - return Chainlink price (47ms)
    ✔ C2 usingTellorChainlinkUntrusted: both Tellor and Chainlink are live and > 5% price difference - remain usingChainlinkTellorUntrusted (48ms)
    ✔ C2 usingTellorChainlinkUntrusted: both Tellor and Chainlink are live and > 5% price difference - return Tellor price (47ms)
    ✔ C3 bothOraclesUntrusted: both Tellor and Chainlink are live and > 5% price difference remain bothOraclesSuspect
    ✔ C3 bothOraclesUntrusted: both Tellor and Chainlink are live and > 5% price difference, return last good price (49ms)
    ✔ C3 bothOraclesUntrusted: both Tellor and Chainlink are live and <= 5% price difference, switch to chainlinkWorking (48ms)
    ✔ C3 bothOraclesUntrusted: both Tellor and Chainlink are live and <= 5% price difference, return Chainlink price (48ms)
    ✔ C4 usingTellorChainlinkFrozen: when both Chainlink and Tellor break, switch to bothOraclesSuspect (49ms)
    ✔ C4 usingTellorChainlinkFrozen: when both Chainlink and Tellor break, return last good price (48ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink breaks and Tellor freezes, switch to usingChainlinkTellorUntrusted (59ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink breaks and Tellor freezes, return last good price (57ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink breaks and Tellor live, switch to usingChainlinkTellorUntrusted (54ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink breaks and Tellor live, return Tellor price (53ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with <5% price difference, switch back to chainlinkWorking (55ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with <5% price difference, return Chainlink current price (59ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with >5% price difference, switch back to usingChainlinkTellorUntrusted (58ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with >5% price difference, return Chainlink current price (55ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with similar price, switch back to chainlinkWorking (56ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor is live with similar price, return Chainlink current price (55ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor breaks, switch to usingChainlinkTellorUntrusted (53ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink is live and Tellor breaks, return Chainlink current price (54ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor breaks, switch to usingChainlinkTellorUntrusted (60ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor broken, return last good price (56ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor live, remain usingTellorChainlinkFrozen (62ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor live, return Tellor price (60ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor freezes, remain usingTellorChainlinkFrozen (58ms)
    ✔ C4 usingTellorChainlinkFrozen: when Chainlink still frozen and Tellor freezes, return last good price (69ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live and Tellor price >5% - no status change (55ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live and Tellor price >5% - return Chainlink price (54ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live and Tellor price within <5%, switch to chainlinkWorking (57ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, Tellor price not within 5%, return Chainlink price (57ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, <50% price deviation from previous, Tellor price not within 5%, remain on usingChainlinkTellorUntrusted (58ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, <50% price deviation from previous, Tellor price not within 5%, return Chainlink price (57ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, >50% price deviation from previous, Tellor price not within 5%, remain on usingChainlinkTellorUntrusted (55ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, >50% price deviation from previous,  Tellor price not within 5%, return Chainlink price (54ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, <50% price deviation from previous, and Tellor is frozen, remain on usingChainlinkTellorUntrusted (68ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, <50% price deviation from previous, Tellor is frozen, return Chainlink price (66ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, >50% price deviation from previous, Tellor is frozen, remain on usingChainlinkTellorUntrusted (67ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink is live, >50% price deviation from previous, Tellor is frozen, return Chainlink price (67ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink frozen, remain on usingChainlinkTellorUntrusted (58ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink frozen, return last good price (56ms)
    ✔ C5 usingChainlinkTellorUntrusted: when Chainlink breaks too, switch to bothOraclesSuspect (54ms)
    ✔ C5 usingChainlinkTellorUntrusted: Chainlink breaks too, return last good price (55ms)
    PriceFeed internal testing contract
      ✔ fetchPrice before setPrice should return the default price
      ✔ should be able to fetchPrice after setPrice, output of former matching input of latter
    Mainnet PriceFeed setup
      ✔ fetchPrice should fail on contract with no chainlink address set
      ✔ fetchPrice should fail on contract with no tellor address set
      ✔ setAddresses should fail whe called by nonOwner (142ms)
      ✔ setAddresses should fail after address has already been set (252ms)

  Contract: BorrowerWrappers
    ✔ proxy owner can recover ERC20
    ✔ non proxy owner cannot recover ERC20 (270ms)
    ✔ claimCollateralAndOpenTrove(): reverts if nothing to claim (943ms)
    ✔ claimCollateralAndOpenTrove(): without sending any value (1644ms)
    ✔ claimCollateralAndOpenTrove(): sending value in the transaction (728ms)
    ✔ claimSPRewardsAndRecycle(): only owner can call it (1138ms)
    ✔ claimSPRewardsAndRecycle(): (750ms)
    ✔ claimStakingGainsAndRecycle(): only owner can call it (1423ms)
    ✔ claimStakingGainsAndRecycle(): reverts if user has no trove (1537ms)
    ✔ claimStakingGainsAndRecycle(): with only collateral gain (1987ms)
    ✔ claimStakingGainsAndRecycle(): with only LUSD gain (538ms)
    ✔ claimStakingGainsAndRecycle(): with both ETH and LUSD gains (1009ms)

  Contract: SortedTroves
    SortedTroves
      ✔ contains(): returns true for addresses that have opened troves (364ms)
      ✔ contains(): returns false for addresses that have not opened troves (357ms)
      ✔ contains(): returns false for addresses that opened and then closed a trove (652ms)
      ✔ contains(): returns true for addresses that opened, closed and then re-opened a trove (970ms)
      ✔ contains(): returns false when there are no troves in the system
      ✔ contains(): true when list size is 1 and the trove the only one in system (137ms)
      ✔ contains(): false when list size is 1 and trove is not in the system (139ms)
      ✔ Finds the correct insert position given two addresses that loosely bound the correct position (1762ms)
      - stays ordered after troves with 'infinite' ICR receive a redistribution
    SortedTroves with mock dependencies
      when params are properly set
        ✔ insert(): fails if list already contains the node
        ✔ insert(): fails if id is zero
        ✔ insert(): fails if NICR is zero
        ✔ remove(): fails if id is not in the list
        ✔ reInsert(): fails if list doesn’t contain the node
        ✔ reInsert(): fails if new NICR is zero
        ✔ findInsertPosition(): No prevId for hint - ascend list starting from nextId, result is after the tail

  Contract: StabilityPool
    Stability Pool Mechanisms
      ✔ provideToSP(): increases the Stability Pool LUSD balance (156ms)
      ✔ provideToSP(): updates the user's deposit record in StabilityPool (158ms)
      ✔ provideToSP(): reduces the user's LUSD balance by the correct amount (157ms)
      ✔ provideToSP(): increases totalLUSDDeposits by correct amount (157ms)
      ✔ provideToSP(): Correctly updates user snapshots of accumulated rewards per unit staked (727ms)
      ✔ provideToSP(), multiple deposits: updates user's deposit and snapshots (2184ms)
      ✔ provideToSP(): reverts if user tries to provide more than their LUSD balance (1067ms)
      ✔ provideToSP(): reverts if user tries to provide 2^256-1 LUSD, which exceeds their balance (734ms)
      ✔ provideToSP(): doesn't impact other users' deposits or collateral gains (1199ms)
      ✔ provideToSP(): doesn't impact system debt, collateral or TCR (1142ms)
      ✔ provideToSP(): doesn't impact any troves, including the caller's trove (738ms)
      ✔ provideToSP(): doesn't protect the depositor's trove from liquidation (648ms)
      ✔ provideToSP(): providing 0 LUSD reverts (1144ms)
      ✔ provideToSP(), new deposit: when SP > 0, triggers OATH reward event - increases the sum G (514ms)
      ✔ provideToSP(), new deposit: when SP is empty, doesn't update G (1596ms)
      ✔ provideToSP(), new deposit: depositor does not receive any OATH rewards (401ms)
      ✔ provideToSP(), new deposit after past full withdrawal: depositor does not receive any OATH rewards (1049ms)
      ✔ provideToSP(), new deposit: depositor does not receive ETH gains (471ms)
      ✔ provideToSP(), new deposit after past full withdrawal: depositor does not receive ETH gains (1066ms)
      ✔ provideToSP(), topup: triggers OATH reward event - increases the sum G (578ms)
      ✔ provideToSP(), topup: depositor receives OATH rewards (630ms)
      ✔ provideToSP(): reverts when amount is zero (721ms)
      ✔ provideToSP(): allowed even when minting paused (848ms)
      ✔ provideToSP(): cannot deposit into older version of protocol (789ms)
      ✔ allows liquidations even when minting paused (611ms)
      ✔ older versions of the protocol can still liquidate (885ms)
      ✔ withdrawFromSP(): reverts when user has no active deposit (878ms)
      ✔ withdrawFromSP(): reverts when amount > 0 and system has an undercollateralized trove (1766ms)
      ✔ withdrawFromSP(): partial retrieval - retrieves correct LUSD amount and the entire ETH Gain, and updates deposit (750ms)
      ✔ withdrawFromSP(): partial retrieval - leaves the correct amount of LUSD in the Stability Pool (732ms)
      ✔ withdrawFromSP(): full retrieval - leaves the correct amount of LUSD in the Stability Pool (808ms)
      ✔ withdrawFromSP(): Subsequent deposit and withdrawal attempt from same account, with no intermediate liquidations, withdraws zero ETH (925ms)
      ✔ withdrawFromSP(): it correctly updates the user's LUSD and ETH snapshots of entitled reward per unit staked (813ms)
      ✔ withdrawFromSP(): decreases StabilityPool ETH (593ms)
      ✔ withdrawFromSP(): All depositors are able to withdraw from the SP to their account (2647ms)
      ✔ withdrawFromSP(): increases depositor's LUSD token balance by the expected amount (1418ms)
      ✔ withdrawFromSP(): doesn't impact other users Stability deposits or ETH gains (1145ms)
      ✔ withdrawFromSP(): doesn't impact system debt, collateral or TCR  (1136ms)
      ✔ withdrawFromSP(): doesn't impact any troves, including the caller's trove (734ms)
      ✔ withdrawFromSP(): succeeds when amount is 0 and system has an undercollateralized trove (590ms)
      ✔ withdrawFromSP(): withdrawing 0 LUSD doesn't alter the caller's deposit or the total LUSD in the Stability Pool (616ms)
      ✔ withdrawFromSP(): withdrawing 0 ETH Gain does not alter the caller's ETH balance, their trove collateral, or the ETH  in the Stability Pool (980ms)
      ✔ withdrawFromSP(): Request to withdraw > caller's deposit only withdraws the caller's compounded deposit (2045ms)
      ✔ withdrawFromSP(): Request to withdraw 2^256-1 LUSD only withdraws the caller's compounded deposit (831ms)
      ✔ withdrawFromSP(): caller can withdraw full deposit and ETH gain during Recovery Mode (913ms)
      ✔ getDepositorCollateralGain(): depositor does not earn further ETH gains from liquidations while their compounded deposit == 0:  (1247ms)
      ✔ withdrawFromSP(): triggers OATH reward event - increases the sum G (610ms)
      ✔ withdrawFromSP(), partial withdrawal: depositor receives OATH rewards (661ms)
      ✔ withdrawFromSP(), full withdrawal: zero's depositor's snapshots (1020ms)
      ✔ withdrawFromSP(), reverts when initial deposit value is 0 (2501ms)
      ✔ withdrawFromSP(): allowed even when minting paused (648ms)
      ✔ withdrawFromSP(): can still withdraw from older version of protocol (915ms)

  Contract: StabilityPool - OATH Rewards
    OATH Rewards
      ✔ withdrawFromSP(): reward term G updates when OATH is issued (378ms)
      ✔ withdrawFromSP(): Depositors with equal initial deposit withdraw correct OATH gain. No liquidations. (805ms)
      ✔ withdrawFromSP(): Depositors with varying initial deposit withdraw correct OATH gain. No liquidations. (857ms)
      ✔ withdrawFromSP(): Depositors with varying initial deposit withdraw correct OATH gain. No liquidations. (2299ms)
      ✔ withdrawFromSP(): Depositor withdraws correct OATH gain after serial pool-emptying liquidations. (2148ms)
      ✔ OATH issuance for a given period is not obtainable if the SP was empty during the period (430ms)
      ✔ withdrawFromSP(): Several deposits of 100 LUSD span one scale factor change. Depositors withdraw correct OATH gains (3619ms)

  Contract: Pool Manager: Sum-Product rounding errors
    - Rounding errors: 100 deposits of 100LUSD into SP, then 200 liquidations of 49LUSD

  Contract: StabilityPool - Withdrawal of stability deposit - Reward calculations
    Stability Pool Withdrawal
      ✔ withdrawFromSP(): Depositors with equal initial deposit withdraw correct compounded deposit and ETH Gain after one liquidation (506ms)
      ✔ withdrawFromSP(): Depositors with equal initial deposit withdraw correct compounded deposit and ETH Gain after two identical liquidations (694ms)
      ✔ withdrawFromSP():  Depositors with equal initial deposit withdraw correct compounded deposit and ETH Gain after three identical liquidations (917ms)
      ✔ withdrawFromSP(): Depositors with equal initial deposit withdraw correct compounded deposit and ETH Gain after two liquidations of increasing LUSD (763ms)
      ✔ withdrawFromSP(): Depositors with equal initial deposit withdraw correct compounded deposit and ETH Gain after three liquidations of increasing LUSD (972ms)
      ✔ withdrawFromSP(): Depositors with varying deposits withdraw correct compounded deposit and ETH Gain after two identical liquidations (775ms)
      ✔ withdrawFromSP(): Depositors with varying deposits withdraw correct compounded deposit and ETH Gain after three identical liquidations (932ms)
      ✔ withdrawFromSP(): Depositors with varying deposits withdraw correct compounded deposit and ETH Gain after three varying liquidations (2186ms)

      ✔ withdrawFromSP(): A, B, C Deposit -> 2 liquidations -> D deposits -> 1 liquidation. All deposits and liquidations = 100 LUSD.  A, B, C, D withdraw correct LUSD deposit and ETH Gain (1039ms)
      ✔ withdrawFromSP(): A, B, C Deposit -> 2 liquidations -> D deposits -> 2 liquidations. All deposits and liquidations = 100 LUSD.  A, B, C, D withdraw correct LUSD deposit and ETH Gain (1230ms)
      ✔ withdrawFromSP(): A, B, C Deposit -> 2 liquidations -> D deposits -> 2 liquidations. Various deposit and liquidation vals.  A, B, C, D withdraw correct LUSD deposit and ETH Gain (1251ms)
      ✔ withdrawFromSP(): A, B, C, D deposit -> 2 liquidations -> D withdraws -> 2 liquidations. All deposits and liquidations = 100 LUSD.  A, B, C, D withdraw correct LUSD deposit and ETH Gain (2495ms)
      ✔ withdrawFromSP(): A, B, C, D deposit -> 2 liquidations -> D withdraws -> 2 liquidations. Various deposit and liquidation vals. A, B, C, D withdraw correct LUSD deposit and ETH Gain (1267ms)
      ✔ withdrawFromSP(): A, B, D deposit -> 2 liquidations -> C makes deposit -> 1 liquidation -> D withdraws -> 1 liquidation. All deposits: 100 LUSD. Liquidations: 100,100,100,50.  A, B, C, D withdraw correct LUSD deposit and ETH Gain (1279ms)
      ✔ withdrawFromSP(): Depositor withdraws correct compounded deposit after liquidation empties the pool (836ms)
      ✔ withdrawFromSP(): Pool-emptying liquidation increases epoch by one, resets scaleFactor to 0, and resets P to 1e18 (1131ms)
      ✔ withdrawFromSP(): Depositors withdraw correct compounded deposit after liquidation empties the pool (884ms)
      ✔ withdrawFromSP(): single deposit fully offset. After subsequent liquidations, depositor withdraws 0 deposit and *only* the ETH Gain from one liquidation (1030ms)
      ✔ withdrawFromSP(): Depositor withdraws correct compounded deposit after liquidation empties the pool (1377ms)
      ✔ withdrawFromSP(): deposit spans one scale factor change: Single depositor withdraws correct compounded deposit and ETH Gain after one liquidation (678ms)
      ✔ withdrawFromSP(): Several deposits of varying amounts span one scale factor change. Depositors withdraw correct compounded deposit and ETH Gain after one liquidation (799ms)
      ✔ withdrawFromSP(): deposit spans one scale factor change: Single depositor withdraws correct compounded deposit and ETH Gain after one liquidation (665ms)
      ✔ withdrawFromSP(): Several deposits of varying amounts span one scale factor change. Depositors withdraws correct compounded deposit and ETH Gain after one liquidation (798ms)
alice deposit: 0
      ✔ withdrawFromSP(): Deposit that decreases to less than 1e-9 of it's original value is reduced to 0 (343ms)
      ✔ withdrawFromSP(): Several deposits of 10000 LUSD span one scale factor change. Depositors withdraws correct compounded deposit and ETH Gain after one liquidation (1183ms)
      ✔ withdrawFromSP(): 2 depositors can withdraw after each receiving half of a pool-emptying liquidation (1254ms)
      ✔ withdrawFromSP(): Depositor's collateral gain stops increasing after two scale changes (1278ms)
497000000000000000000
      ✔ withdrawFromSP(): Large liquidated coll/debt, deposits and ETH price (639ms)
      ✔ withdrawFromSP(): Small liquidated coll/debt, large deposits and ETH price (1667ms)

  Contract: TroveManager
    ✔ liquidate(): closes a Trove that has ICR < MCR (468ms)
    ✔ liquidate(): decreases ActivePool ETH and LUSDDebt by correct amounts (380ms)
    ✔ liquidate(): increases DefaultPool ETH and LUSD debt by correct amounts (378ms)
    ✔ liquidate(): removes the Trove's stake from the total stakes (366ms)
    ✔ liquidate(): Removes the correct trove from the TroveOwners array, and moves the last array element to the new empty slot (918ms)
    ✔ liquidate(): updates the snapshots of total stakes and total collateral (370ms)
    ✔ liquidate(): updates the L_ETH and L_LUSDDebt reward-per-unit-staked totals (749ms)
    ✔ liquidate(): Liquidates undercollateralized trove if there are two troves in the system (427ms)
    ✔ liquidate(): reverts if trove is non-existent (468ms)
    ✔ liquidate(): reverts if trove has been closed (1059ms)
    ✔ liquidate(): does nothing if trove has >= MCR ICR (563ms)
    ✔ liquidate(): Given the same price and no other trove changes, complete Pool offsets restore the TCR to its value prior to the defaulters opening troves (2837ms)
    ✔ liquidate(): Pool offsets increase the TCR (1661ms)
    ✔ liquidate(): a pure redistribution reduces the TCR only as a result of compensation (1689ms)
    ✔ liquidate(): does not affect the SP deposit or ETH gain when called on an SP depositor's address that has no trove (1003ms)
    ✔ liquidate(): does not liquidate a SP depositor's trove with ICR > MCR, and does not affect their SP deposit or ETH gain (2141ms)
    ✔ liquidate(): liquidates a SP depositor's trove with ICR < MCR, and the liquidation correctly impacts their SP deposit and ETH gain (794ms)
    ✔ liquidate(): does not alter the liquidated user's token balance (835ms)
    ✔ liquidate(): liquidates based on entire/collateral debt (including pending rewards), not raw collateral/debt (2890ms)
    ✔ liquidate(): when SP > 0, triggers LQTY reward event - increases the sum G (782ms)
    ✔ liquidate(): when SP is empty, doesn't update G (801ms)
    ✔ liquidateTroves(): liquidates a Trove that a) was skipped in a previous liquidation and b) has pending rewards (1337ms)
    ✔ liquidateTroves(): closes every Trove with ICR < MCR, when n > number of undercollateralized troves (1485ms)
    ✔ liquidateTroves(): liquidates  up to the requested number of undercollateralized troves (934ms)
    ✔ liquidateTroves(): does nothing if all troves have ICR > MCR (1156ms)
    ✔ liquidateTroves(): liquidates based on entire/collateral debt (including pending rewards), not raw collateral/debt (925ms)
    ✔ liquidateTroves(): reverts if n = 0 (1128ms)
    ✔ liquidateTroves():  liquidates troves with ICR < MCR (1138ms)
    ✔ liquidateTroves(): does not affect the liquidated user's token balances (1001ms)
    ✔ liquidateTroves(): A liquidation sequence containing Pool offsets increases the TCR (1495ms)
    ✔ liquidateTroves(): A liquidation sequence of pure redistributions decreases the TCR, due to gas compensation, but up to 0.5% (1459ms)
    ✔ liquidateTroves(): Liquidating troves with SP deposits correctly impacts their SP deposit and ETH gain (790ms)
    ✔ liquidateTroves(): when SP > 0, triggers LQTY reward event - increases the sum G (956ms)
    ✔ liquidateTroves(): when SP is empty, doesn't update G (981ms)
    ✔ batchLiquidateTroves(): liquidates a Trove that a) was skipped in a previous liquidation and b) has pending rewards (2624ms)
    ✔ batchLiquidateTroves(): closes every trove with ICR < MCR in the given array (996ms)
    ✔ batchLiquidateTroves(): does not liquidate troves that are not in the given array (958ms)
    ✔ batchLiquidateTroves(): does not close troves with ICR >= MCR in the given array (1009ms)
    ✔ batchLiquidateTroves(): reverts if array is empty (1305ms)
    ✔ batchLiquidateTroves(): skips if trove is non-existent (842ms)
    ✔ batchLiquidateTroves(): skips if a trove has been closed (1024ms)
    ✔ batchLiquidateTroves: when SP > 0, triggers LQTY reward event - increases the sum G (930ms)
    ✔ batchLiquidateTroves(): when SP is empty, doesn't update G (2191ms)
    ✔ getRedemptionHints(): gets the address of the first Trove and the final ICR of the last Trove involved in a redemption (526ms)
    ✔ getRedemptionHints(): returns 0 as partialRedemptionHintNICR when reaching _maxIterations (512ms)
    ✔ redeemCollateral(): cancels the provided LUSD with debt from Troves with the lowest ICRs and sends an equivalent amount of Ether (714ms)
    ✔ redeemCollateral(): allowed even when minting paused (721ms)
    ✔ redeemCollateral(): allowed for older versions of the protocol (1009ms)
    ✔ redeemCollateral(): works for new versions of the protocol (2370ms)
    ✔ redeemCollateral(): with invalid first hint, zero address (719ms)
    ✔ redeemCollateral(): with invalid first hint, non-existent trove (716ms)
    ✔ redeemCollateral(): with invalid first hint, trove below MCR (884ms)
    ✔ redeemCollateral(): ends the redemption sequence when the token redemption request has been filled (1023ms)
    ✔ redeemCollateral(): ends the redemption sequence when max iterations have been reached (752ms)
    ✔ redeemCollateral(): performs partial redemption if resultant debt is > minimum net debt (2389ms)
    ✔ redeemCollateral(): doesn't perform partial redemption if resultant debt would be < minimum net debt (2374ms)
    ✔ redeemCollateral(): doesnt perform the final partial redemption in the sequence if the hint is out-of-date (818ms)
    ✔ redeemCollateral(): can redeem if there is zero active debt but non-zero debt in DefaultPool (498ms)
    ✔ redeemCollateral(): doesn't touch Troves with ICR < MCR (371ms)
    ✔ redeemCollateral(): finds the last Trove with ICR == MCR even if there is more than one (797ms)
    ✔ redeemCollateral(): reverts when TCR < MCR (1335ms)
    ✔ redeemCollateral(): reverts when argument _amount is 0 (1119ms)
    ✔ redeemCollateral(): reverts if max fee > 100% (1523ms)
    ✔ redeemCollateral(): reverts if max fee < 0.5% (3624ms)
    ✔ redeemCollateral(): reverts if fee exceeds max fee percentage (3276ms)
    ✔ redeemCollateral(): succeeds if fee is less than max fee percentage (2153ms)
    ✔ redeemCollateral(): doesn't affect the Stability Pool deposits or ETH gain of redeemed-from troves (4633ms)
    ✔ redeemCollateral(): caller can redeem their entire LUSDToken balance (759ms)
    ✔ redeemCollateral(): reverts when requested redemption amount exceeds caller's LUSD token balance (1384ms)
    ✔ redeemCollateral(): value of issued ETH == face value of redeemed LUSD (assuming 1 LUSD has value of $1) (1058ms)
    ✔ redeemCollateral(): reverts if there is zero outstanding system debt (45ms)
    ✔ redeemCollateral(): reverts if caller's tries to redeem more than the outstanding system debt (732ms)
    ✔ redeemCollateral(): a redemption made when base rate is zero increases the base rate (890ms)
    ✔ redeemCollateral(): a redemption made when base rate is non-zero increases the base rate, for negligible time passed (1229ms)
    ✔ redeemCollateral(): lastFeeOpTime doesn't update if less time than decay interval has passed since the last fee operation [ @skip-on-coverage ] (1565ms)
    ✔ redeemCollateral(): a redemption made at zero base rate send a non-zero ETHFee to LQTY staking contract (2283ms)
    ✔ redeemCollateral(): a redemption made at zero base increases the ETH-fees-per-LQTY-staked in LQTY Staking contract (868ms)
60637000000000000000000
1
57428000000000000000000
    ✔ redeemCollateral(): redemption fees keeps track of per-unit-staked error due to floor division (1220ms)
    ✔ redeemCollateral(): a redemption made at a non-zero base rate send a non-zero ETHFee to LQTY staking contract (1226ms)
    ✔ redeemCollateral(): a redemption made at a non-zero base rate increases ETH-per-LQTY-staked in the staking contract (1248ms)
    ✔ redeemCollateral(): a redemption sends the ETH remainder (ETHDrawn - ETHFee) to the redeemer (2166ms)
    ✔ redeemCollateral(): a full redemption (leaving trove with 0 debt), closes the trove (1115ms)
    ✔ redeemCollateral(): emits correct debt and coll values in each redeemed trove's TroveUpdated event (1097ms)
    ✔ redeemCollateral(): a redemption that closes a trove leaves the trove's ETH surplus (collateral - ETH drawn) available for the trove owner to claim (1906ms)
    ✔ redeemCollateral(): a redemption that closes a trove leaves the trove's ETH surplus (collateral - ETH drawn) available for the trove owner after re-opening trove (2094ms)
    ✔ redeemCollateral(): reverts if fee eats up all returned collateral (1696ms)
    ✔ getPendingLUSDDebtReward(): Returns 0 if there is no pending LUSDDebt reward (486ms)
    ✔ getPendingCollateralReward(), collaterals[0].address: Returns 0 if there is no pending ETH reward (487ms)
    ✔ computeICR(): Returns 0 if trove's coll is worth 0
    ✔ computeICR(): Returns 2^256-1 for ETH:USD = 100, coll = 1 ETH, debt = 100 LUSD
    ✔ computeICR(): returns correct ICR for ETH:USD = 100, coll = 200 ETH, debt = 30 LUSD
    ✔ computeICR(): returns correct ICR for ETH:USD = 250, coll = 1350 ETH, debt = 127 LUSD
    ✔ computeICR(): returns correct ICR for ETH:USD = 100, coll = 1 ETH, debt = 54321 LUSD
    ✔ computeICR(): Returns 2^256-1 if trove has non-zero coll and zero debt
    ✔ checkRecoveryMode(): Returns true when TCR < 165% (277ms)
    ✔ checkRecoveryMode(): Returns false when TCR == 165% (276ms)
    ✔ checkRecoveryMode(): Returns false when TCR > 165% (280ms)
    ✔ checkRecoveryMode(): Returns false when TCR == 0 (285ms)
    ✔ getTroveStake(): Returns stake (256ms)
    ✔ getTroveColl(), collaterals[0].address: Returns coll (249ms)
    ✔ getTroveDebt(): Returns debt (251ms)
    ✔ getTroveStatus(): Returns status (313ms)
    ✔ hasPendingRewards(): Returns false it trove is not active

  Contract: TroveManager - Redistribution reward calculations
    ✔ redistribution: A, B Open. B Liquidated. C, D Open. D Liquidated. Distributes correct rewards (1213ms)
    ✔ redistribution: A, B Open. Minting paused. B Liquidated. Minting resumed. C, D Open. D Liquidated. Distributes correct rewards (778ms)
    ✔ redistribution: A, B Open. Protocol upgraded. B Liquidated. C, D Open. D Liquidated. Distributes correct rewards (1064ms)
    ✔ redistribution: A, B, C Open. C Liquidated. D, E, F Open. F Liquidated. Distributes correct rewards (1034ms)
    ✔ redistribution: Sequence of alternate opening/liquidation: final surviving trove has ETH from all previously liquidated troves (2866ms)
    ✔ redistribution: A,B,C,D,E open. Liq(A). B adds coll. Liq(C). B and D have correct coll and debt (1238ms)
    ✔ redistribution: A,B,C,D open. Liq(A). B adds coll. Liq(C). B and D have correct coll and debt (1336ms)
    ✔ redistribution: A,B,C Open. Liq(C). B adds coll. Liq(A). B acquires all coll and debt (857ms)
    ✔ redistribution: A,B,C Open. Liq(C). B tops up coll. D Opens. Liq(D). Distributes correct rewards. (888ms)
    ✔ redistribution: Trove with the majority stake tops up. A,B,C, D open. Liq(D). C tops up. E Enters, Liq(E). Distributes correct rewards (1014ms)
    ✔ redistribution: Trove with the majority stake tops up. A,B,C, D open. Liq(D). A, B, C top up. E Enters, Liq(E). Distributes correct rewards (1230ms)
    ✔ redistribution: A,B,C Open. Liq(C). B withdraws coll. Liq(A). B acquires all coll and debt (894ms)
    ✔ redistribution: A,B,C Open. Liq(C). B withdraws coll. D Opens. Liq(D). Distributes correct rewards. (897ms)
    ✔ redistribution: Trove with the majority stake withdraws. A,B,C,D open. Liq(D). C withdraws some coll. E Enters, Liq(E). Distributes correct rewards (987ms)
    ✔ redistribution: Trove with the majority stake withdraws. A,B,C,D open. Liq(D). A, B, C withdraw. E Enters, Liq(E). Distributes correct rewards (1195ms)
    ✔ redistribution, all operations: A,B,C open. Liq(A). D opens. B adds, C withdraws. Liq(B). E & F open. D adds. Liq(F). Distributes correct rewards (1492ms)
    ✔ redistribution, all operations: A,B,C open. Liq(A). D opens. B adds, C withdraws. Liq(B). E & F open. D adds. Liq(F). Varying coll. Distributes correct rewards (1497ms)

  Contract: TroveManager - in Recovery Mode
    ✔ checkRecoveryMode(): Returns true if TCR falls below CCR (297ms)
    ✔ checkRecoveryMode(): Returns true if TCR stays less than CCR (414ms)
    ✔ checkRecoveryMode(): returns false if TCR stays above CCR (351ms)
    ✔ checkRecoveryMode(): returns false if TCR rises above CCR (370ms)
    ✔ liquidate(), with ICR < 100%: removes stake and updates totalStakes (410ms)
    ✔ liquidate(), with ICR < 100%: updates system snapshots correctly (630ms)
    ✔ liquidate(), with ICR < 100%: closes the Trove and removes it from the Trove array (414ms)
    ✔ liquidate(), with ICR < 100%: only redistributes to active Troves - no offset to Stability Pool (521ms)
    ✔ liquidate(), with 100 < ICR < MCR: removes stake and updates totalStakes (413ms)
    ✔ liquidate(), with 100% < ICR < MCR: updates system snapshots correctly (641ms)
    ✔ liquidate(), with 100% < ICR < MCR: closes the Trove and removes it from the Trove array (396ms)
    ✔ liquidate(), with 100% < ICR < MCR: offsets as much debt as possible with the Stability Pool, then redistributes the remainder coll and debt (562ms)
    ✔ liquidate(), with ICR > MCR, trove has lowest ICR, and StabilityPool is empty: does nothing (766ms)
    ✔ liquidate(), with MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: offsets the trove entirely with the pool (2093ms)
    ✔ liquidate(), with ICR% = MCR < TCR, and StabilityPool LUSD > debt to liquidate: offsets the trove entirely with the pool, there’s no collateral surplus (547ms)
    ✔ liquidate(), with  MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: removes stake and updates totalStakes (576ms)
    ✔ liquidate(), with  MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: updates system snapshots (553ms)
    ✔ liquidate(), with MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: closes the Trove (578ms)
    ✔ liquidate(), with MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: can liquidate troves out of order (1400ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: Trove remains active (950ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: Trove remains in TroveOwners array (788ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: nothing happens (775ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: updates system shapshots (777ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: causes correct Pool offset and ETH gain, and doesn't redistribute to active troves (1072ms)
    ✔ liquidate(), with ICR > MCR, and StabilityPool LUSD < liquidated debt: ICR of non liquidated trove does not change (1313ms)
    ✔ liquidate() with ICR > MCR, and StabilityPool LUSD < liquidated debt: total liquidated coll and debt is correct (1305ms)
    ✔ liquidate(): Doesn't liquidate undercollateralized trove if it is the only trove in the system (367ms)
    ✔ liquidate(): Liquidates undercollateralized trove if there are two troves in the system (1547ms)
    ✔ liquidate(): does nothing if trove has >= MCR ICR and the Stability Pool is empty (787ms)
    ✔ liquidate(): does nothing if trove ICR >= TCR, and SP covers trove's debt (942ms)
    ✔ liquidate(): reverts if trove is non-existent (571ms)
    ✔ liquidate(): reverts if trove has been closed (990ms)
    ✔ liquidate(): liquidates based on entire/collateral debt (including pending rewards), not raw collateral/debt (1453ms)
    ✔ liquidate(): does not affect the SP deposit or ETH gain when called on an SP depositor's address that has no trove (889ms)
    ✔ liquidate(): does not alter the liquidated user's token balance (860ms)
    ✔ liquidate(), with MCR < ICR < TCR, can claim collateral, re-open, be reedemed and claim again (1080ms)
    ✔ liquidate(), with MCR < ICR < TCR, can claim collateral, after another claim from a redemption (1068ms)
    ✔ liquidateTroves(): With all ICRs > MCR, Liquidates Troves until system leaves recovery mode (3284ms)
    ✔ liquidateTroves(): Liquidates Troves until 1) system has left recovery mode AND 2) it reaches a Trove with ICR >= MCR (1126ms)
    ✔ liquidateTroves(): liquidates only up to the requested number of undercollateralized troves (992ms)
    ✔ liquidateTroves(): does nothing if n = 0 (833ms)
    ✔ liquidateTroves(): closes every Trove with ICR < MCR, when n > number of undercollateralized troves (1122ms)
    ✔ liquidateTroves(): a liquidation sequence containing Pool offsets increases the TCR (2829ms)
    ✔ liquidateTroves(): A liquidation sequence of pure redistributions decreases the TCR, due to gas compensation, but up to 0.5% (1358ms)
    ✔ liquidateTroves(): liquidates based on entire/collateral debt (including pending rewards), not raw collateral/debt (858ms)
    ✔ liquidateTroves(): does nothing if all troves have ICR > MCR% and Stability Pool is empty (2500ms)
    ✔ liquidateTroves(): emits liquidation event with correct values when all troves have ICR > MCR% and Stability Pool covers a subset of troves (1107ms)
    ✔ liquidateTroves():  emits liquidation event with correct values when all troves have ICR > MCR and Stability Pool covers a subset of troves, including a partial (1152ms)
    ✔ liquidateTroves(): does not affect the liquidated user's token balances (746ms)
    ✔ liquidateTroves(): Liquidating troves at 100 < ICR < MCR with SP deposits correctly impacts their SP deposit and ETH gain (829ms)
    ✔ liquidateTroves(): Liquidating troves at ICR <=100% with SP deposits does not alter their deposit or ETH gain (850ms)
    ✔ liquidateTroves() with a non fullfilled liquidation: non liquidated trove remains active (954ms)
    ✔ liquidateTroves() with a non fullfilled liquidation: non liquidated trove remains in TroveOwners Array (1000ms)
gasUsed:  1061206
true
    ✔ liquidateTroves() with a non fullfilled liquidation: still can liquidate further troves after the non-liquidated, emptied pool (1119ms)
gasUsed:  1061206
    ✔ liquidateTroves() with a non fullfilled liquidation: still can liquidate further troves after the non-liquidated, non emptied pool (1034ms)
    ✔ liquidateTroves() with a non fullfilled liquidation: total liquidated coll and debt is correct (988ms)
    ✔ liquidateTroves() with a non fullfilled liquidation: emits correct liquidation event values (1009ms)
    ✔ liquidateTroves() with a non fullfilled liquidation: ICR of non liquidated trove does not change (968ms)
    ✔ batchLiquidateTroves(): Liquidates all troves with ICR < MCR, transitioning Normal -> Recovery Mode (2527ms)
    ✔ batchLiquidateTroves(): Liquidates all troves with ICR < MCR, transitioning Recovery -> Normal Mode (1121ms)
    ✔ batchLiquidateTroves(): Liquidates all troves with ICR < MCR, transitioning Normal -> Recovery Mode (1288ms)
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: non liquidated trove remains active (2632ms)
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: non liquidated trove remains in Trove Owners array (968ms)
gasUsed:  1079846
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: still can liquidate further troves after the non-liquidated, emptied pool (1029ms)
gasUsed:  1079846
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: still can liquidate further troves after the non-liquidated, non emptied pool (1032ms)
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: total liquidated coll and debt is correct (978ms)
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: emits correct liquidation event values (2424ms)
    ✔ batchLiquidateTroves() with a non fullfilled liquidation: ICR of non liquidated trove does not change (974ms)
    ✔ batchLiquidateTroves(), with MCR < ICR < TCR, and StabilityPool LUSD > debt to liquidate: can liquidate troves out of order (1116ms)
    ✔ batchLiquidateTroves(), with MCR < ICR < TCR, and StabilityPool empty: doesn't liquidate any troves (3182ms)
    ✔ batchLiquidateTroves(): skips liquidation of troves with ICR > TCR, regardless of Stability Pool size (2539ms)
    ✔ batchLiquidateTroves(): emits liquidation event with correct values when all troves have ICR > MCR and Stability Pool covers a subset of troves (1148ms)
    ✔ batchLiquidateTroves(): emits liquidation event with correct values when all troves have ICR > MCR and Stability Pool covers a subset of troves, including a partial (1174ms)

  Contract: TroveManager - in Recovery Mode - back to normal mode in 1 tx
    Batch liquidations
      ✔ First trove only doesn’t get out of Recovery Mode (733ms)
      ✔ Two troves over MCR are liquidated (805ms)
      ✔ Stability Pool profit matches (774ms)
      ✔ A trove over TCR is not liquidated (711ms)
    Sequential liquidations
      ✔ First trove only doesn’t get out of Recovery Mode (596ms)
      ✔ Two troves over MCR are liquidated (609ms)

  Contract: TroveManager
totalStakesSnapshot after L1: 200000002000000000000000
totalCollateralSnapshot after L1: 399000002000000000000000
Snapshots ratio after L1: 501253135332064484
B pending ETH reward after L1: 39799999602000000000000
B stake after L1: 40000000000000000000000
B stake after A1: 39999999999999998005012
Snapshots ratio after A1: 501253135332064484
B stake after L2: 39999999999999998005012
Snapshots ratio after L2: 501253134833317614
B stake after A2: 39999999999999496909580
B stake after L3: 39999999999999496909580
Snapshots ratio after L3: 501253134334569494
B stake after A3: 39999999999998895914661
B stake after L4: 39999999999998895914661
Snapshots ratio after L4: 501253133835821123
B stake after A4: 39999999999998274860443
B stake after L5: 39999999999998274860443
Snapshots ratio after L5: 501253133337072702
B stake after A5: 39999999999997649714964
B stake after L6: 39999999999997649714964
Snapshots ratio after L6: 501253132838324270
B stake after A6: 39999999999997023671832
B stake after L7: 39999999999997023671832
Snapshots ratio after L7: 501253132339575837
B stake after A7: 39999999999996397369769
B stake after L8: 39999999999996397369769
Snapshots ratio after L8: 501253131840827402
B stake after A8: 39999999999995770936519
B stake after L9: 39999999999995770936519
Snapshots ratio after L9: 501253131342078967
B stake after A9: 39999999999995144397630
B stake after L10: 39999999999995144397630
Snapshots ratio after L10: 501253130843330532
B stake after A10: 39999999999994517758213
B stake after L11: 39999999999994517758213
Snapshots ratio after L11: 501253130344582097
B stake after A11: 39999999999993891019290
    ✔ A given trove's stake decline is negligible with adjustments and tiny liquidations (6250ms)


  884 passing (18m)
  7 pending

$ npx hardhat test --config hardhat.config.mainnet-fork.js


  Contract: Leverager
Your project has Truffle migrations, which have to be turned into a fixture to run your tests with Hardhat
(node:16983) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
BigNumber.toString does not accept any parameters; base-10 is assumed
    ✔ Levers up with 1 iteration (232ms)
    ✔ Levers up with 2 iterations (397ms)
    ✔ Delevers and closes from 1.3 CR max leverage (4813ms)
    ✔ Reverts with too many iterations


  4 passing (12s)
```
