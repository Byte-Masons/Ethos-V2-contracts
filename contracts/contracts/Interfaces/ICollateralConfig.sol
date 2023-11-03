// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.6.11;

interface ICollateralConfig {
    function getAllowedCollaterals() external view returns (address[] memory);
    function getCollateralCCR(address _collateral) external view returns (uint256);
    function getCollateralDecimals(address _collateral) external view returns (uint256);
    function getCollateralMCR(address _collateral) external view returns (uint256);
    function getCollateralDebtLimit(address _collateral) external view returns (uint256);
    function getCollateralOracleTimeout(address _collateral) external view returns (uint256);
    function initialize(
        address[] calldata _collaterals,
        uint256[] calldata _MCRs,
        uint256[] calldata _CCRs,
        uint256[] calldata _debtLimits,
        uint256[] calldata _oracleTimeouts
    ) external;
    function isCollateralAllowed(address _collateral) external view returns (bool);
}
