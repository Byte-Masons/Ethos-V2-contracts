const mainnetLocalForkUpgrade = require("../mainnetDeployment/mainnetLocalForkUpgrade.js")

mainnetLocalForkUpgrade.upgrade(false).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
