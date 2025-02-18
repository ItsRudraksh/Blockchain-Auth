require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18", // Specify the Solidity version
  networks: {
    hardhat: {
      chainId: 1337, // Default chain ID for Hardhat's local blockchain
    },
    // localhost: {
    //   url: "http://localhost:8545", // Hardhat local node URL
    // },
  },
};
