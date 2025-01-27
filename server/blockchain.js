const express = require("express");
const cors = require("cors");
const { Web3 } = require("web3");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const web3 = new Web3("http://127.0.0.1:8545"); // Blockchain endpoint
const contractABI = require("./TokenRegistry.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Validate token
app.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = web3.utils.sha3(token);
    const isValid = await contract.methods.validateToken(hashedToken).call();

    res.json({ valid: isValid });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).send("Blockchain validation failed");
  }
});

// Register token
app.post("/register-token", async (req, res) => {
  try {
    const { token, expiryTime } = req.body;
    const hashedToken = web3.utils.sha3(token);

    const accounts = await web3.eth.getAccounts();
    await contract.methods
      .registerToken(hashedToken, expiryTime)
      .send({ from: accounts[0] });

    res.send("Token registered successfully");
  } catch (error) {
    console.error("Error registering token:", error);
    res.status(500).send("Failed to register token");
  }
});

// Remove token
app.post("/remove-token", async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = web3.utils.sha3(token);

    const accounts = await web3.eth.getAccounts();
    await contract.methods.removeToken(hashedToken).send({ from: accounts[0] });

    res.send("Token removed successfully");
  } catch (error) {
    console.error("Error removing token:", error);
    res.status(500).send("Failed to remove token");
  }
});

const PORT = process.env.BLOCKCHAIN_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Blockchain service running on http://localhost:${PORT}`);
});
