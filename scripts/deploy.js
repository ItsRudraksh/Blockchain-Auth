const { ethers } = require("hardhat");

async function main() {
  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = await TokenRegistry.deploy();

  await tokenRegistry.waitForDeployment();

  const contractAddress = await tokenRegistry.getAddress();

  console.log("TokenRegistry deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
