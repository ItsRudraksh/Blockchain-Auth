require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    besulocal: {
      chainId: 1337,
      url: "http://127.0.0.1:8545", // Besu local RPC (if that's where Besu is running)
      accounts: [
        `0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3`,
      ],
    },
  },
};
