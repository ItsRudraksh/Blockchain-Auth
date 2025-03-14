# Blockchain-Auth Project Overview

This project is a blockchain-based authentication system that combines traditional web authentication with blockchain technology for enhanced security and token validation. The system uses a smart contract to register, validate, and remove authentication tokens, providing an additional layer of security beyond traditional JWT-based authentication.

## Major Technologies Used

### 1. Blockchain Technologies

#### Hardhat (v2.22.17)
- **Latest Version**: 2.22.4 (as of May 2024)
- **Purpose**: Development environment for Ethereum smart contracts
- **Key Features**: 
  - Ethereum Development Runtime (EDR) - a Rust-based runtime introduced in v2.21.0
  - Support for BigInt arguments in tasks
  - Improved performance and error reporting
  - Local blockchain node for development

#### Solidity (v0.8.18)
- **Purpose**: Smart contract programming language
- **Usage**: Used to create the TokenRegistry contract that manages authentication tokens on the blockchain

#### Ethers.js (v6.13.5)
- **Latest Version**: 6.13.5
- **Purpose**: JavaScript library for interacting with the Ethereum blockchain
- **Key Features**:
  - Uses native ES2020 BigInt instead of custom BigNumber class
  - Improved contract interactions with ES6 Proxy
  - Enhanced transaction handling and utilities
  - Better provider management

#### Web3.js (v4.16.0)
- **Latest Version**: 4.16.0
- **Purpose**: Alternative JavaScript library for Ethereum blockchain interaction
- **Key Changes from v1.x**:
  - Module import syntax changes
  - No callback support (except for event listeners)
  - Must use 'new' keyword for contract instantiation
  - Returns BigInt instead of strings for numeric values

### 2. Backend Technologies

#### Express.js (v4.21.2)
- **Latest Version**: 5.0.0 released in September 2024 (project uses 4.21.2)
- **Purpose**: Web application framework for Node.js
- **Key Features**:
  - RESTful API endpoints for authentication
  - Middleware support for request processing
  - Integration with MongoDB and blockchain

#### MongoDB with Mongoose (v8.10.1)
- **Latest Version**: 8.10.1
- **Purpose**: NoSQL database for storing user information
- **Key Features**:
  - Schema-based modeling
  - Built-in validation
  - Query building
  - Middleware support

#### JWT (jsonwebtoken v9.0.2)
- **Purpose**: JSON Web Tokens for authentication
- **Usage**: Used alongside blockchain validation for a dual-layer authentication system

#### bcrypt (v5.1.1)
- **Purpose**: Password hashing library
- **Usage**: Secures user passwords in the database

## Consensus Mechanism

The Blockchain-Auth project currently uses the **Proof of Stake (PoS)** consensus mechanism through its integration with the Ethereum Sepolia testnet.

### Current Implementation: Proof of Stake (Sepolia Testnet)

The project is configured to connect to the Sepolia testnet, which transitioned from Proof of Authority to Proof of Stake after Ethereum's merge. Sepolia uses a permissioned validator set with the following characteristics:

- **Validator Selection**: Validators are chosen based on the amount of cryptocurrency they're willing to "stake" as collateral
- **Energy Efficiency**: Significantly more energy-efficient than Proof of Work
- **Security Model**: Security is derived from validators having financial stake in the network's integrity
- **Block Creation**: Validators are selected to create new blocks based on their stake and a randomization process

In the project's `hardhat.config.js`, the Sepolia network is configured with:
```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    chainId: 11155111,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gasPrice: "auto"
  }
}
```

### Consensus Implementation in the Project

The consensus mechanism is not directly implemented in the project code but is inherited from the blockchain network it connects to. The project interacts with the blockchain through:

1. **Provider Connection**: The application connects to the Ethereum network (local or Sepolia) through a provider:
   ```javascript
   const provider = new ethers.JsonRpcProvider(getRpcUrl());
   ```

2. **Transaction Signing**: Transactions are signed using a wallet with a private key:
   ```javascript
   const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
   ```

3. **Contract Interaction**: The application interacts with the TokenRegistry smart contract:
   ```javascript
   const contract = new ethers.Contract(contractAddress, contractABI, wallet);
   ```

### Benefits of Blockchain Consensus for Authentication

The integration of blockchain consensus mechanisms provides several significant advantages for the authentication flow in this application:

#### 1. Enhanced Security Through Decentralization

**How it helps the flow**: The current Proof of Stake consensus on Sepolia distributes the validation of authentication tokens across multiple validators, making it extremely difficult for attackers to compromise the system.

**Advantage over traditional systems**: Unlike centralized authentication systems where a single database breach can compromise all user credentials, this system requires attackers to compromise both the application server (for JWT) and the blockchain network (requiring 51% of validators), creating a significantly higher security threshold.

#### 2. Immutable Audit Trail

**How it helps the flow**: Every token registration, validation, and removal operation is recorded on the blockchain as a transaction, creating an immutable audit trail that cannot be altered retroactively.

**Advantage over traditional systems**: Traditional authentication systems typically store logs in databases that can be modified or deleted. The blockchain's immutability ensures that authentication events are permanently recorded, providing superior forensic capabilities and compliance benefits.

#### 3. Transparent and Verifiable Operations

**How it helps the flow**: The application tracks and returns performance metrics for blockchain operations, allowing for transparent monitoring of the authentication process.

**Advantage over traditional systems**: Most authentication systems operate as black boxes where the internal workings are hidden. This blockchain-based system allows for independent verification of authentication events by any party with access to the blockchain.

#### 4. Resistance to Denial of Service Attacks

**How it helps the flow**: The economic cost of blockchain transactions (gas fees) creates a natural deterrent against denial of service attacks targeting the authentication system.

**Advantage over traditional systems**: Traditional systems can be overwhelmed by repeated login attempts or registration requests. The cost associated with blockchain transactions makes such attacks economically unfeasible at scale.

#### 5. Flexible Security Models Through Different Consensus Mechanisms

**How it helps the flow**: The planned implementation of multiple consensus mechanisms (PoS, PoA, PoW) will allow the application to adapt its security model based on specific requirements:

- **Proof of Stake (current)**: Balances security with energy efficiency, suitable for most production environments
- **Proof of Authority (planned)**: Offers faster authentication with lower resource requirements, ideal for private enterprise deployments
- **Proof of Work (planned)**: Provides maximum decentralization and security, appropriate for high-security applications

**Advantage over traditional systems**: Traditional authentication systems typically offer a one-size-fits-all security model. The ability to switch between consensus mechanisms allows this system to adapt to different security requirements, deployment environments, and scale considerations.

#### 6. Elimination of Single Points of Failure

**How it helps the flow**: Authentication validation is distributed across the blockchain network rather than relying solely on a single server or database.

**Advantage over traditional systems**: Traditional JWT-based authentication systems are vulnerable if the secret key is compromised. This hybrid approach ensures that even if the JWT secret is exposed, attackers still cannot create valid authentication tokens without also compromising the blockchain component.

#### 7. Cross-Platform and Cross-Application Authentication

**How it helps the flow**: The blockchain-based token registry can potentially be used by multiple applications, creating a unified authentication layer.

**Advantage over traditional systems**: Traditional authentication systems are typically siloed to specific applications. The blockchain approach allows for a more unified authentication infrastructure that could be extended across multiple services while maintaining security boundaries.

## Full Authentication Flow

The authentication flow in the Blockchain-Auth project is centralized in the `main.js` file and combines traditional JWT-based authentication with blockchain validation. Here's the complete flow:

### 1. User Registration (Signup)

1. **Request Validation**: When a user submits a signup request, the `validateRequest` middleware validates the username and password.

2. **Database Check**: The system checks if the username already exists in MongoDB.

3. **Password Hashing**: If the username is available, the password is hashed using bcrypt:
   ```javascript
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

4. **User Creation**: A new user is created in the MongoDB database:
   ```javascript
   const newUser = new User({ username, password: hashedPassword });
   await newUser.save();
   ```

5. **JWT Generation**: A JWT token is created with the username and a 5-minute expiry:
   ```javascript
   const token = jwt.sign({ username }, SECRET, { expiresIn: "5m" });
   ```

6. **Blockchain Registration**: The token is registered on the blockchain using the TokenRegistry smart contract:
   ```javascript
   const { expiryTime, gasUsed, executionTime } = await registerTokenOnBlockchain(token);
   ```

7. **Token Storage**: The token is sent to the client as an HTTP-only cookie:
   ```javascript
   res.cookie("token", token, { httpOnly: true, maxAge: 300000 });
   ```

### 2. User Authentication (Login)

1. **Credential Verification**: The system verifies the username and password against the database:
   ```javascript
   const user = await User.findOne({ username });
   if (!user || !(await bcrypt.compare(password, user.password))) {
     return res.status(401).json({ message: "Invalid credentials" });
   }
   ```

2. **JWT Generation**: A JWT token is created with the username and a 5-minute expiry.

3. **Blockchain Registration**: The token is registered on the blockchain with a 5-minute expiry:
   ```javascript
   const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));
   const expiryTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes
   const tx = await contract.registerToken(hashedToken, expiryTime);
   ```

4. **Token Storage**: The token is sent to the client as an HTTP-only cookie.

### 3. Protected Route Access

1. **Token Extraction**: When a user accesses a protected route, the `authMiddleware` extracts the token from cookies:
   ```javascript
   const token = req.cookies?.token;
   ```

2. **JWT Verification**: The JWT is verified using the secret key:
   ```javascript
   const decoded = jwt.verify(token, SECRET);
   ```

3. **User Verification**: The system checks if the user exists in the database:
   ```javascript
   const user = await User.findOne({ username: decoded.username });
   ```

4. **Blockchain Validation**: The token is validated on the blockchain:
   ```javascript
   const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));
   const isValid = await contract.validateToken(hashedToken);
   ```

5. **Access Grant**: If all validations pass, the user is granted access to the protected resource.

### 4. User Logout

1. **Token Extraction**: The token is extracted from cookies.

2. **Blockchain Removal**: The token is invalidated on the blockchain:
   ```javascript
   const hashedToken = ethers.keccak256(ethers.toUtf8Bytes(token));
   const tx = await contract.removeToken(hashedToken);
   ```

3. **Cookie Clearing**: The token cookie is cleared:
   ```javascript
   res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
   ```

### 5. Blockchain Token Management

The TokenRegistry smart contract manages tokens with these functions:

1. **Token Registration**:
   ```solidity
   function registerToken(bytes32 tokenHash, uint256 expiry) public {
       require(!tokens[tokenHash].isValid, "Token already exists");
       tokens[tokenHash] = TokenInfo(true, expiry);
   }
   ```

2. **Token Validation**:
   ```solidity
   function validateToken(bytes32 tokenHash) public view returns (bool) {
       return
           tokens[tokenHash].isValid &&
           block.timestamp < tokens[tokenHash].expiry;
   }
   ```

3. **Token Removal**:
   ```solidity
   function removeToken(bytes32 tokenHash) public {
       require(tokens[tokenHash].isValid, "Token does not exist");
       tokens[tokenHash].isValid = false;
   }
   ```

### Performance Tracking

Throughout the authentication flow, the system tracks performance metrics:

- **JWT Validation Time**: Time taken to verify the JWT
- **Blockchain Validation Time**: Time taken for blockchain operations
- **Database Query Time**: Time taken for database operations
- **Gas Used**: Amount of gas used for blockchain transactions
- **Total Processing Time**: Overall time taken to process the request

These metrics are included in the API responses to provide transparency and help with optimization.

## Key Features

1. **Dual-layer Authentication**: Combines traditional JWT with blockchain validation
2. **Token Expiry**: Tokens expire both at the JWT level and blockchain level
3. **Performance Metrics**: Tracks and returns processing times for various operations
4. **Gas Usage Tracking**: Monitors blockchain transaction costs
5. **Middleware Architecture**: Well-structured middleware for authentication, validation, and error handling

## Setup and Usage

To run the project:

1. Install dependencies: `npm install`
2. Start a blockchain node: `npx hardhat node`
3. Deploy the smart contract: `npx hardhat run scripts/deploy.js --network localhost`
4. Update the `.env` file with the contract address
5. Start the server: `nodemon server/main.js`

The project requires Node.js version 18.17.1 or higher due to Hardhat compatibility.

## Conclusion

This Blockchain-Auth project demonstrates an innovative approach to authentication by combining traditional web authentication methods with blockchain technology. It leverages modern JavaScript frameworks and libraries to create a secure, performant authentication system with multiple layers of validation. The planned implementation of different consensus mechanisms (PoA and PoW) will allow for comparison and optimization based on specific security and performance requirements.
