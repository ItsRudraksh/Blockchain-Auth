const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Web3 } = require("web3");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { expressjwt: jwtMiddleware } = require("express-jwt");
const TokenRegistry = require("./TokenRegistry.json");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const secret = process.env.SECRET;
const web3 = new Web3("http://127.0.0.1:8545"); // Your blockchain endpoint
const contractABI = TokenRegistry.abi; // Add your contract ABI
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mock database for user data and token tracking
const users = {};
let activeTokens = [];

// Middleware to verify JWT
const verifyJWT = jwtMiddleware({
  secret: secret,
  algorithms: ["HS256"],
  getToken: (req) => req.cookies?.token,
});

// Middleware to verify token on blockchain
const verifyOnBlockchain = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send("No token provided");

    const hashedToken = web3.utils.sha3(token);
    const isValid = await contract.methods.validateToken(hashedToken).call();
    console.log(`verification toke: ${hashedToken}`);
    if (!isValid) {
      return res.status(401).send("Token is invalid or expired on blockchain");
    }
    next();
  } catch (error) {
    console.error("Blockchain verification failed:", error);
    res.status(500).send("Blockchain verification failed");
  }
};

// Middleware to issue token
const issueToken = async (req, res, next) => {
  try {
    const { username } = req.body;

    const token = jwt.sign({ username }, secret, { expiresIn: "5m" }); // JWT with 5-minutes expiry
    const hashedToken = web3.utils.sha3(token);
    console.log(`Issuing token: ${hashedToken}`);

    // Store token hash on blockchain
    const accounts = await web3.eth.getAccounts();
    const expiryTime = Math.floor(Date.now() / 1000) + 300; // Current time + 5 minutes
    await contract.methods
      .registerToken(hashedToken, expiryTime)
      .send({ from: accounts[0] });

    // Add to active tokens list
    activeTokens.push({ hash: hashedToken, expiry: expiryTime });

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 300000 }); // 5-minutes expiry

    next();
  } catch (error) {
    console.error("Error issuing token:", error);
    res.status(500).send("Failed to issue token");
  }
};

// Sign-up endpoint
app.post(
  "/signup",
  async (req, res, next) => {
    const { username, password } = req.body;

    if (users[username]) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };

    // Proceed to issue a token after successful signup
    req.body.username = username; // Pass username to issueToken middleware
    next();
  },
  issueToken,
  (req, res) => {
    res.send("User registered and logged in successfully");
  }
);

// Login endpoint with token issuance
app.post(
  "/login",
  async (req, res, next) => {
    const { username, password } = req.body;

    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    next();
  },
  issueToken,
  verifyOnBlockchain,
  (req, res) => {
    res.send("Login successful");
  }
);

app.get("/verify-token", verifyJWT, verifyOnBlockchain, (req, res) => {
  res.send("Token is valid");
});

// Cron job to remove expired tokens every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job to remove expired tokens...");
  const currentTime = Math.floor(Date.now() / 1000);

  const expiredTokens = activeTokens.filter(
    (token) => token.expiry <= currentTime
  );

  if (expiredTokens.length > 0) {
    const accounts = await web3.eth.getAccounts();
    for (const token of expiredTokens) {
      try {
        await contract.methods
          .removeToken(token.hash)
          .send({ from: accounts[0] });
        console.log(`Removed expired token: ${token.hash}`);
      } catch (error) {
        console.error(`Failed to remove token: ${token.hash}`, error);
      }
    }

    activeTokens = activeTokens.filter((token) => token.expiry > currentTime);
  } else {
    console.log("No expired tokens to remove.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
