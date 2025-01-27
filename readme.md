# Running the Blockchain Authentication Project

To run the Blockchain Authentication project, you will need to use three terminals. Follow the instructions below:

**Note:** Ensure you are using Node.js version 18.17.1 due to Hardhat compatibility. You can use `nvm` to manage Node.js versions.

## Install Dependencies

1. Navigate to the root folder of the project.
2. Run the following command to install all necessary packages:

```bash
npm install
```

## Terminal 1: Start the Blockchain Node

1. Navigate to the root folder of the project.
2. Run the following command to start the blockchain node:

```bash
npx hardhat node
```

## Terminal 2: Deploy the Smart Contract and Start the Backend Server

1. In a new terminal, navigate to the root folder of the project.
2. Deploy the smart contract by running:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. After deploying the contract, start the backend server using (for new update):

```bash
nodemon server/main.js
```

## Important Step: Update Environment Variables and Move Artifacts

1. After successfully deploying the smart contract, copy the contract address and paste it into the `.env` file.
2. Navigate to the newly created folder `artifacts -> contracts -> Auth.sol`.
3. Locate the `example.json` file (not the `.dbg.json` file).
4. Move the `example.json` file to the `server` folder.

**Note:** Since this is running on localhost, you will need to redeploy the contract after every use.

## Terminal 3: Start the Frontend Application (Optional)

1. In a third terminal, navigate to the frontend folder:

```bash
cd frontend
```

2. Run the following command to start the frontend application:

```bash
npm run dev
```

Now you can test the application by accessing the frontend in your browser.

**Note:** Hardhat was used for quickness in development. We can always switch to Hyperledger or any other blockchain platform as needed.
