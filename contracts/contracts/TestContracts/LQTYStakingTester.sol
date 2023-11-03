// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.6.11;

import "../LQTY/LQTYStaking.sol";


contract LQTYStakingTester is LQTYStaking {
    function requireCallerIsTroveMorRH() external view {
        _requireCallerIsTroveMorRH();
    }
}
