const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/authDB").then(() => {
  console.log("Connected to db");
})
const User = mongoose.model("User", new mongoose.Schema({ username: String, password: String }));

// Global timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Blockchain setup
const NETWORK = process.env.NETWORK || 'local';
const getRpcUrl = () => {
  switch(NETWORK) {
    case 'sepolia':
      return process.env.INFURA_SEPOLIA_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
    default:
      return "http://127.0.0.1:8545";
  }
};

const provider = new ethers.JsonRpcProvider(getRpcUrl());
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractABI = require("./TokenRegistry.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Response formatter middleware
const formatResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    const processingTime = Date.now() - req.startTime;
    const formattedResponse = {
      ...data,
      processingTime: `${processingTime}ms`,
      status: data.status || "success",
      jwtValidationTime: req.jwtValidationTime || "N/A",
      blockchainValidationTime: req.blockchainValidationTime || "N/A",
      dbQueryTime: req.dbQueryTime || "N/A",
      gasUsed: req.gasUsed || "N/A",
    };
    return oldJson.call(this, formattedResponse);
  };
  next();
};

app.use(formatResponse);

//Error Middleware
app.use((err, req, res, next) => {
  console.error("Error Middleware:", err.message);

  if (err.message === "TOKEN_MISSING") {
    return res.status(401).json({ status: "error", message: "Token does not exist or expired" });
  }

  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Blockchain functions
async function callBlockchain(token) {
  try {
    const start = Date.now();
    const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));
    const isValid = await contract.validateToken(hashedToken);
    const executionTime = Date.now() - start;

    return { isValid, executionTime };
  } catch (error) {
    console.error("Blockchain call failed:", error);
    throw new Error("Blockchain validation failed");
  }
}

async function registerTokenOnBlockchain(token) {
  try {
    const start = Date.now();
    const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));
    const expiryTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes

    const tx = await contract.registerToken(hashedToken, expiryTime);
    const receipt = await tx.wait(); // Wait for the transaction to be mined
    const gasUsed = receipt.gasUsed.toString();
    const executionTime = Date.now() - start;

    return { expiryTime, gasUsed, executionTime };
  } catch (error) {
    console.error("Error registering token on blockchain:", error);
    throw new Error("Failed to register token");
  }
}

async function removeTokenFromBlockchain(token) {
  try {
    const start = Date.now();
    const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));

    const tx = await contract.removeToken(hashedToken);
    const receipt = await tx.wait(); // Wait for the transaction to be mined
    const gasUsed = receipt.gasUsed.toString();
    const executionTime = Date.now() - start;

    return { success: true, gasUsed, executionTime };
  } catch (error) {
    console.error("Error removing token from blockchain:", error);
    throw new Error("Failed to remove token from blockchain");
  }
}

//Validation Middleware
const validateRequest = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || typeof username !== "string" || username.length < 3) {
    return res.status(400).json({ message: "Invalid username" });
  }
  if (!password || typeof password !== "string" || password.length < 4) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  next();
};


// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new Error("TOKEN_MISSING");
    }

    const jwtStart = Date.now();
    const decoded = jwt.verify(token, SECRET);
    req.jwtValidationTime = `${Date.now() - jwtStart}ms`;
    req.user = decoded;

    const dbStart = Date.now();
    const user = await User.findOne({ username: decoded.username });
    req.dbQueryTime = `${Date.now() - dbStart}ms`;

    if (!user) {
      throw new Error("TOKEN_MISSING");
    }

    const { isValid, executionTime } = await callBlockchain(token);
    req.blockchainValidationTime = `${executionTime}ms`;

    if (!isValid) {
      throw new Error("TOKEN_MISSING");
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Service Layer
const serviceLayer = async (req, res, next) => {
  try {
    console.log("Service Layer: Processing request for user", req.user.username);
    req.serviceResult = { message: "Service logic executed successfully" };
    next();
  } catch (error) {
    next(error);
  }
};

// Post-service middleware
const postServiceMiddleware = async (req, res, next) => {
  try {
    console.log("Post-Service: Blockchain validated successfully");
    res.json(req.serviceResult);
  } catch (error) {
    next(error);
  }
};

// Error Middleware
app.use((err, req, res, next) => {
  console.error("Error Middleware:", err.message);
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

// Public routes
app.post("/signup", validateRequest, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const dbStart = Date.now();
    const existingUser = await User.findOne({ username });
    req.dbQueryTime = `${Date.now() - dbStart}ms`;

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    const dbSaveStart = Date.now();
    await newUser.save();
    req.dbQueryTime = `${Date.now() - dbSaveStart}ms`;

    // Measure JWT signing time
    const jwtStart = Date.now();
    const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
    req.jwtValidationTime = `${Date.now() - jwtStart}ms`;

    // Register token on blockchain
    const { expiryTime, gasUsed, executionTime } = await registerTokenOnBlockchain(token);
    req.blockchainValidationTime = `${executionTime}ms`;
    req.gasUsed = gasUsed;  // ✅ Assign gasUsed to req.gasUsed

    res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
    res.json({
      message: "User registered successfully"
    });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const dbStart = Date.now();
    const user = await User.findOne({ username });
    req.dbQueryTime = `${Date.now() - dbStart}ms`;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Measure JWT signing time
    const jwtStart = Date.now();
    const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
    req.jwtValidationTime = `${Date.now() - jwtStart}ms`;

    // Register token on blockchain
    const { expiryTime, gasUsed, executionTime } = await registerTokenOnBlockchain(token);
    req.blockchainValidationTime = `${executionTime}ms`;
    req.gasUsed = gasUsed;  // ✅ Assign gasUsed to req.gasUsed

    res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
    res.json({
      message: "Login successful"
    });
  } catch (error) {
    next(error);
  }
});


app.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    const { success, gasUsed, executionTime } = await removeTokenFromBlockchain(token);

    req.blockchainValidationTime = `${executionTime}ms`;
    req.gasUsed = gasUsed;

    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

// Protected route
app.get("/protected", authMiddleware, serviceLayer, postServiceMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
