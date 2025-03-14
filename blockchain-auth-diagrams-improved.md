# Blockchain-Auth Diagrams (Improved Readability)

This document contains visual representations of the Blockchain-Auth project using Mermaid diagrams with improved readability.

## System Architecture Diagram

```mermaid
flowchart TB
    User([👤 User/Client])
    
    subgraph BackendServer["Backend Server"]
        direction TB
        Express["🖥️ Express.js Server"]
        Middleware["🔒 Authentication Middleware"]
        Routes["🛣️ API Routes"]
        BCService["⛓️ Blockchain Service"]
    end
    
    subgraph DataStorage["Data Storage"]
        direction TB
        MongoDB[("💾 MongoDB")]
        TokenRegistry["📝 TokenRegistry<br/>Smart Contract"]
    end
    
    subgraph BlockchainNetwork["Blockchain Network"]
        direction TB
        Ethereum{"🌐 Ethereum Network"}
        Validators[("👥 Validators")]
        Consensus["🔄 Consensus<br/>Mechanism"]
    end
    
    User <--> Express
    Express --> Routes
    Routes --> Middleware
    Middleware --> MongoDB
    Middleware --> BCService
    BCService --> TokenRegistry
    TokenRegistry --> Ethereum
    Ethereum <--> Validators
    Validators <--> Consensus
    
    classDef default fontSize:14px
    classDef server fill:#FF9AFF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef storage fill:#9999FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef blockchain fill:#99FF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef user fill:#FFFF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    
    class User user
    class Express,Middleware,Routes,BCService server
    class MongoDB,TokenRegistry storage
    class Ethereum,Validators,Consensus blockchain
    
    style BackendServer fill:#FFD6FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    style DataStorage fill:#D6D6FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    style BlockchainNetwork fill:#D6FFD6,stroke:#333,stroke-width:2px,color:black,font-weight:bold
```

## Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Server as 🖥️ Express Server
    participant DB as 💾 MongoDB
    participant JWT as 🔑 JWT Service
    participant BC as ⛓️ Blockchain (TokenRegistry)
    
    %% Registration Flow
    User->>Server: POST /signup (username, password)
    Server->>Server: Validate request
    Server->>DB: Check if user exists
    DB-->>Server: User exists? (yes/no)
    alt User exists
        Server-->>User: 400 - User already exists
    else User doesn't exist
        Server->>DB: Create new user with hashed password
        DB-->>Server: User created
        Server->>JWT: Generate JWT token
        JWT-->>Server: JWT token
        Server->>BC: Register token on blockchain
        Note over Server,BC: Hash token and set expiry time
        BC-->>Server: Transaction receipt (gas used, etc.)
        Server-->>User: 200 - User registered + Set cookie
    end
    
    %% Login Flow
    User->>Server: POST /login (username, password)
    Server->>DB: Find user
    DB-->>Server: User data
    alt Invalid credentials
        Server-->>User: 401 - Invalid credentials
    else Valid credentials
        Server->>JWT: Generate JWT token
        JWT-->>Server: JWT token
        Server->>BC: Register token on blockchain
        BC-->>Server: Transaction receipt
        Server-->>User: 200 - Login successful + Set cookie
    end
    
    %% Protected Route Access
    User->>Server: GET /protected (with cookie)
    Server->>JWT: Verify JWT token
    JWT-->>Server: Token valid? (yes/no)
    Server->>DB: Find user
    DB-->>Server: User exists? (yes/no)
    Server->>BC: Validate token on blockchain
    BC-->>Server: Token valid? (yes/no)
    alt Any validation fails
        Server-->>User: 401 - Unauthorized
    else All validations pass
        Server->>Server: Process request
        Server-->>User: 200 - Protected resource
    end
    
    %% Logout Flow
    User->>Server: POST /logout (with cookie)
    Server->>BC: Remove token from blockchain
    BC-->>Server: Transaction receipt
    Server-->>User: 200 - Logged out + Clear cookie
```

## Consensus Mechanism Comparison

```mermaid
graph TD
    CM["🔄 Consensus Mechanisms"]
    
    CM --> PoS["🥩 Proof of Stake<br/>(Current)"]
    CM --> PoA["🔐 Proof of Authority<br/>(Planned)"]
    CM --> PoW["⛏️ Proof of Work<br/>(Planned)"]
    
    subgraph CurrentImpl["Current Implementation"]
        direction TB
        PoS_Val["👥 Validator Selection:<br/>Based on stake amount"]
        PoS_Eff["⚡ Energy Efficiency:<br/>High"]
        PoS_Sec["🛡️ Security Model:<br/>Financial stake"]
        PoS_Use["🌐 Use Case:<br/>Production environments"]
        
        PoS --> PoS_Val
        PoS --> PoS_Eff
        PoS --> PoS_Sec
        PoS --> PoS_Use
    end
    
    subgraph PlannedImpl["Planned Implementation"]
        direction TB
        PoA_Val["👤 Validator Selection:<br/>Based on identity/reputation"]
        PoA_Eff["⚡⚡ Energy Efficiency:<br/>Very High"]
        PoA_Sec["🛡️ Security Model:<br/>Reputation stake"]
        PoA_Use["🏢 Use Case:<br/>Private enterprise deployments"]
        
        PoW_Val["💻 Validator Selection:<br/>Based on computational power"]
        PoW_Eff["⚡ Energy Efficiency:<br/>Low"]
        PoW_Sec["🛡️🛡️ Security Model:<br/>Computational cost"]
        PoW_Use["🔒 Use Case:<br/>High-security applications"]
        
        PoA --> PoA_Val
        PoA --> PoA_Eff
        PoA --> PoA_Sec
        PoA --> PoA_Use
        
        PoW --> PoW_Val
        PoW --> PoW_Eff
        PoW --> PoW_Sec
        PoW --> PoW_Use
    end
    
    classDef default fontSize:14px,color:black
    classDef current fill:#99FF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef planned fill:#9999FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef main fill:#FFCC99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    
    class CM main
    class PoS current
    class PoS_Val,PoS_Eff,PoS_Sec,PoS_Use current
    class PoA,PoA_Val,PoA_Eff,PoA_Sec,PoA_Use,PoW,PoW_Val,PoW_Eff,PoW_Sec,PoW_Use planned
    
    style CurrentImpl fill:#D6FFD6,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    style PlannedImpl fill:#D6D6FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
```

## Token Lifecycle Diagram

```mermaid
stateDiagram-v2
    [*] --> TokenCreated: User Login/Signup
    
    TokenCreated --> TokenRegistered: Register on Blockchain
    TokenRegistered --> TokenActive: Store in Cookie
    
    TokenActive --> TokenValidated: Access Protected Route
    TokenValidated --> TokenActive: Validation Successful
    
    TokenActive --> TokenInvalidated: User Logout
    TokenActive --> TokenExpired: 5 minutes elapsed
    
    TokenInvalidated --> [*]
    TokenExpired --> [*]
    
    note right of TokenCreated: 🔑 JWT token generated
    note right of TokenRegistered: 📝 Token hash stored on blockchain
    note right of TokenValidated: ✅ Both JWT and blockchain validation
    note right of TokenInvalidated: ❌ Token marked invalid on blockchain
    note right of TokenExpired: ⏱️ Expires both in JWT and blockchain
```

## Dual-Layer Security Model

```mermaid
graph TD
    User([👤 User/Client])
    
    subgraph Layer1["Layer 1: Traditional Authentication"]
        direction TB
        JWT["🔑 JWT Validation"]
        Cookie["🍪 HTTP-Only Cookie"]
        DB[("💾 User Database")]
    end
    
    subgraph Layer2["Layer 2: Blockchain Authentication"]
        direction TB
        SC["📄 Smart Contract"]
        BV["⛓️ Blockchain Validation"]
        Consensus["🔄 Consensus Mechanism"]
    end
    
    User --> Cookie
    Cookie --> JWT
    JWT --> DB
    JWT --> SC
    SC --> BV
    BV --> Consensus
    
    %% Advantages
    Adv1["🛡️ Enhanced Security"]
    Adv2["📜 Immutable Audit Trail"]
    Adv3["🛑 DoS Resistance"]
    Adv4["🔀 No Single Point of Failure"]
    
    Consensus --> Adv1
    Consensus --> Adv2
    Consensus --> Adv3
    Consensus --> Adv4
    
    classDef default fontSize:14px,color:black
    classDef traditional fill:#FF9AFF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef blockchain fill:#99FF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef advantage fill:#FFFF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef user fill:#FFCC99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    
    class User user
    class JWT,Cookie,DB traditional
    class SC,BV,Consensus blockchain
    class Adv1,Adv2,Adv3,Adv4 advantage
    
    style Layer1 fill:#FFD6FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    style Layer2 fill:#D6FFD6,stroke:#333,stroke-width:2px,color:black,font-weight:bold
```

## Performance Metrics Tracking

```mermaid
graph LR
    Request["📥 API Request"] --> Start["⏱️ Start Timer"]
    
    Start --> JWT["🔑 JWT Validation"]
    JWT --> |Time Tracked| JWTTime["⏱️ JWT Validation Time"]
    
    JWT --> DB["💾 Database Operations"]
    DB --> |Time Tracked| DBTime["⏱️ DB Query Time"]
    
    DB --> BC["⛓️ Blockchain Operations"]
    BC --> |Time Tracked| BCTime["⏱️ Blockchain Validation Time"]
    BC --> |Gas Tracked| Gas["⛽ Gas Used"]
    
    BCTime --> End["⏱️ End Timer"]
    Gas --> End
    DBTime --> End
    JWTTime --> End
    
    End --> Total["⏱️ Total Processing Time"]
    
    Total --> Response["📤 API Response with Metrics"]
    
    classDef default fontSize:14px,color:black
    classDef operation fill:#9999FF,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef metric fill:#99FF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef endpoint fill:#FFCC99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    classDef timer fill:#FFFF99,stroke:#333,stroke-width:2px,color:black,font-weight:bold
    
    class Request,Response endpoint
    class JWT,DB,BC operation
    class JWTTime,DBTime,BCTime,Gas,Total metric
    class Start,End timer
```

These diagrams provide visual representations of the key components and processes in the Blockchain-Auth project with improved readability. 