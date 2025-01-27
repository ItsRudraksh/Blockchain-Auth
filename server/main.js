// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { Web3 } = require("web3");
// const cookieParser = require("cookie-parser");
// const dotenv = require("dotenv");
// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// const PORT = process.env.PORT || 3000;
// const SECRET = process.env.SECRET;

// // Blockchain setup
// const web3 = new Web3("http://127.0.0.1:8545");
// const contractABI =
//   require("./artifacts/contracts/Auth.sol/TokenRegistry.json").abi;
// const contractAddress = process.env.CONTRACT_ADDRESS;
// const contract = new web3.eth.Contract(contractABI, contractAddress);

// // Mock database for user management
// const users = {};

// // Blockchain functions
// async function callBlockchain(token) {
//   try {
//     const hashedToken = web3.utils.sha3(token);
//     const isValid = await contract.methods.validateToken(hashedToken).call();
//     return isValid;
//   } catch (error) {
//     console.error("Blockchain call failed:", error);
//     throw new Error("Blockchain validation failed");
//   }
// }

// async function registerTokenOnBlockchain(token) {
//   try {
//     const hashedToken = web3.utils.sha3(token);
//     const expiryTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes
//     const accounts = await web3.eth.getAccounts();

//     await contract.methods
//       .registerToken(hashedToken, expiryTime)
//       .send({ from: accounts[0] });

//     return expiryTime;
//   } catch (error) {
//     console.error("Error registering token on blockchain:", error);
//     throw new Error("Failed to register token");
//   }
// }

// async function removeTokenFromBlockchain(token) {
//   try {
//     const hashedToken = web3.utils.sha3(token);
//     const accounts = await web3.eth.getAccounts();

//     await contract.methods.removeToken(hashedToken).send({ from: accounts[0] });

//     return true;
//   } catch (error) {
//     console.error("Error removing token from blockchain:", error);
//     throw new Error("Failed to remove token from blockchain");
//   }
// }

// // Authentication middleware - Only apply to protected routes
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.cookies?.token;
//     if (!token) {
//       throw new Error("No token provided");
//     }

//     // Validate JWT
//     const decoded = jwt.verify(token, SECRET);
//     req.user = decoded;

//     // Start blockchain validation
//     req.blockchainResult = callBlockchain(token);

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Service Layer
// const serviceLayer = async (req, res, next) => {
//   try {
//     console.log(
//       "Service Layer: Processing request for user",
//       req.user.username
//     );
//     req.serviceResult = { message: "Service logic executed successfully" };
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Post-service middleware
// const postServiceMiddleware = async (req, res, next) => {
//   try {
//     const isBlockchainValid = await req.blockchainResult;

//     if (!isBlockchainValid) {
//       throw new Error("Blockchain validation failed");
//     }

//     console.log("Post-Service: Blockchain validated successfully");

//     const processingTime = Date.now() - req.startTime;
//     const finalResponse = {
//       ...req.serviceResult,
//       status: "success",
//       processingTime: `${processingTime}ms`,
//     };
//     res.status(200).json(finalResponse);
//   } catch (error) {
//     next(error);
//   }
// };

// // Error Middleware
// app.use((err, req, res, next) => {
//   console.error("Error Middleware:", err.message);
//   res.status(500).json({ status: "error", message: err.message });
// });

// // Public routes
// app.post("/signup", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     if (users[username]) {
//       return res.status(400).send("User already exists");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     users[username] = { password: hashedPassword };

//     const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
//     await registerTokenOnBlockchain(token);

//     res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
//     res.send("User registered successfully");
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/login", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;
//     const user = users[username];

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).send("Invalid credentials");
//     }

//     const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
//     await registerTokenOnBlockchain(token);

//     res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
//     res.send("Login successful");
//   } catch (error) {
//     next(error);
//   }
// });

// // Logout route
// app.post("/logout", authMiddleware, async (req, res, next) => {
//   try {
//     const token = req.cookies?.token;

//     // Remove token from blockchain
//     await removeTokenFromBlockchain(token);

//     // Clear the cookie
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     });

//     res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     next(error);
//   }
// });

// // Protected routes - use the middleware chain
// app.get("/protected", authMiddleware, serviceLayer, postServiceMiddleware);

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Web3 } = require("web3");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Global timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;

// Blockchain setup
const web3 = new Web3("http://127.0.0.1:8545");
const contractABI =
  require("./artifacts/contracts/Auth.sol/TokenRegistry.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Mock database for user management
const users = {};

// Response formatter middleware
const formatResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    const processingTime = Date.now() - req.startTime;
    const formattedResponse = {
      ...data,
      processingTime: `${processingTime}ms`,
      status: data.status || "success",
    };
    return oldJson.call(this, formattedResponse);
  };
  next();
};

app.use(formatResponse);

// Blockchain functions
async function callBlockchain(token) {
  try {
    const hashedToken = web3.utils.sha3(token);
    const isValid = await contract.methods.validateToken(hashedToken).call();
    return isValid;
  } catch (error) {
    console.error("Blockchain call failed:", error);
    throw new Error("Blockchain validation failed");
  }
}

async function registerTokenOnBlockchain(token) {
  try {
    const hashedToken = web3.utils.sha3(token);
    const expiryTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    const accounts = await web3.eth.getAccounts();

    await contract.methods
      .registerToken(hashedToken, expiryTime)
      .send({ from: accounts[0] });

    return expiryTime;
  } catch (error) {
    console.error("Error registering token on blockchain:", error);
    throw new Error("Failed to register token");
  }
}

async function removeTokenFromBlockchain(token) {
  try {
    const hashedToken = web3.utils.sha3(token);
    const accounts = await web3.eth.getAccounts();

    await contract.methods.removeToken(hashedToken).send({ from: accounts[0] });

    return true;
  } catch (error) {
    console.error("Error removing token from blockchain:", error);
    throw new Error("Failed to remove token from blockchain");
  }
}

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    req.blockchainResult = callBlockchain(token);

    next();
  } catch (error) {
    next(error);
  }
};

// Service Layer
const serviceLayer = async (req, res, next) => {
  try {
    console.log(
      "Service Layer: Processing request for user",
      req.user.username
    );
    req.serviceResult = { message: "Service logic executed successfully" };
    next();
  } catch (error) {
    next(error);
  }
};

// Post-service middleware
const postServiceMiddleware = async (req, res, next) => {
  try {
    const isBlockchainValid = await req.blockchainResult;

    if (!isBlockchainValid) {
      throw new Error("Blockchain validation failed");
    }

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
app.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (users[username]) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };

    const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
    await registerTokenOnBlockchain(token);

    res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
    res.json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = users[username];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
    await registerTokenOnBlockchain(token);

    res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
    res.json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    await removeTokenFromBlockchain(token);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
app.get("/protected", authMiddleware, serviceLayer, postServiceMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
