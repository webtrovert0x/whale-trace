require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.trim() !== ""
  ? [process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY.trim() : `0x${process.env.PRIVATE_KEY.trim()}`]
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainTestnet: {
      url: process.env.RPC_URL || "https://rpc.bohr.life",
      chainId: 968,
      accounts: PRIVATE_KEY,
    },
  },
};

