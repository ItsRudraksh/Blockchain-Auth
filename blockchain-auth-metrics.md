# Blockchain-Auth Metrics Analysis

## Gas Cost Estimation and Request Capacity

With 0.0906 SepoliaETH, we can estimate how many authentication requests you can perform based on the gas costs of different operations in the authentication flow.

### Gas Cost Estimates per Operation

| Operation | Function | Estimated Gas | Gas Cost (Gwei) | ETH Cost (@ 20 Gwei gas price) |
|-----------|----------|---------------|-----------------|--------------------------------|
| Registration | `registerToken()` | ~50,000 | 1,000,000 | 0.001 ETH |
| Validation | `validateToken()` | ~30,000 | 600,000 | 0.0006 ETH |
| Removal | `removeToken()` | ~35,000 | 700,000 | 0.0007 ETH |

### Request Capacity with 0.0906 SepoliaETH

#### Signup/Login Requests (registerToken)
- ETH Available: 0.0906 SepoliaETH
- Cost per Request: ~0.001 ETH
- **Maximum Signup/Login Requests: ~90 requests**

#### Protected Route Accesses (validateToken)
- ETH Available: 0.0906 SepoliaETH
- Cost per Request: ~0.0006 ETH
- **Maximum Protected Route Accesses: ~151 requests**

#### Logout Requests (removeToken)
- ETH Available: 0.0906 SepoliaETH
- Cost per Request: ~0.0007 ETH
- **Maximum Logout Requests: ~129 requests**

#### Complete Authentication Cycles
A complete authentication cycle includes:
1. Signup/Login (registerToken)
2. Access Protected Route (validateToken)
3. Logout (removeToken)

- Total Cost per Cycle: ~0.001 + 0.0006 + 0.0007 = 0.0023 ETH
- **Maximum Complete Cycles: ~39 full authentication cycles**

### Factors Affecting Gas Costs

1. **Network Congestion**: Gas prices fluctuate based on network demand
2. **Contract Complexity**: More complex operations consume more gas
3. **Blockchain State**: Current state of the blockchain can affect gas costs
4. **Gas Price Settings**: Higher gas prices lead to faster transaction confirmations

## Metrics Tracking Table for Graphing

Below is a table template you can use to track metrics for each request. This data can be plotted on graphs to visualize performance.

| Request ID | Operation Type | JWT Validation Time (ms) | DB Query Time (ms) | Blockchain Validation Time (ms) | Gas Used | Total Processing Time (ms) | Status Code | Timestamp |
|------------|----------------|--------------------------|--------------------|---------------------------------|----------|----------------------------|-------------|-----------|
| 1 | Signup | | | | | | | |
| 2 | Login | | | | | | | |
| 3 | Protected | | | | | | | |
| 4 | Logout | | | | | | | |
| 5 | Signup | | | | | | | |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Sample Data (Example)

| Request ID | Operation Type | JWT Validation Time (ms) | DB Query Time (ms) | Blockchain Validation Time (ms) | Gas Used | Total Processing Time (ms) | Status Code | Timestamp |
|------------|----------------|--------------------------|--------------------|---------------------------------|----------|----------------------------|-------------|-----------|
| 1 | Signup | 12 | 45 | 3250 | 48500 | 3307 | 200 | 2024-11-20 10:15:23 |
| 2 | Login | 10 | 38 | 3120 | 47800 | 3168 | 200 | 2024-11-20 10:16:05 |
| 3 | Protected | 8 | 32 | 1850 | 29500 | 1890 | 200 | 2024-11-20 10:16:30 |
| 4 | Logout | 9 | 30 | 2450 | 34200 | 2489 | 200 | 2024-11-20 10:17:15 |
| 5 | Signup | 11 | 42 | 3180 | 49200 | 3233 | 200 | 2024-11-20 10:18:02 |

## Recommended Graphs for Visualization

Based on the metrics collected, you can create the following graphs:

1. **Operation Time Comparison**
   - Bar chart comparing JWT, DB, and Blockchain validation times across different operations
   - X-axis: Operation Type
   - Y-axis: Time (ms)

2. **Gas Usage by Operation Type**
   - Bar chart showing average gas usage for each operation type
   - X-axis: Operation Type
   - Y-axis: Gas Used

3. **Total Processing Time Trend**
   - Line chart showing total processing time over multiple requests
   - X-axis: Request ID or Timestamp
   - Y-axis: Total Processing Time (ms)

4. **Correlation: Gas Used vs. Blockchain Validation Time**
   - Scatter plot to identify correlation between gas used and blockchain validation time
   - X-axis: Gas Used
   - Y-axis: Blockchain Validation Time (ms)

5. **Operation Success Rate**
   - Pie chart showing proportion of successful vs. failed operations
   - Categories: Success (200), Client Error (4xx), Server Error (5xx)

## Postman Collection Setup for Metrics Collection

To efficiently collect these metrics using Postman:

1. **Create Environment Variables**:
   - `baseUrl`: Your API base URL
   - `authToken`: Store the JWT token from login/signup responses

2. **Add Tests Script to Each Request**:
   ```javascript
   // Extract metrics from response
   var responseData = pm.response.json();
   
   // Store metrics in a collection variable
   var metrics = pm.collectionVariables.get("metrics") || "[]";
   var metricsArray = JSON.parse(metrics);
   
   // Add new metrics
   metricsArray.push({
       requestId: metricsArray.length + 1,
       operationType: pm.info.requestName,
       jwtValidationTime: responseData.jwtValidationTime,
       dbQueryTime: responseData.dbQueryTime,
       blockchainValidationTime: responseData.blockchainValidationTime,
       gasUsed: responseData.gasUsed,
       totalProcessingTime: responseData.processingTime,
       statusCode: pm.response.code,
       timestamp: new Date().toISOString()
   });
   
   // Save updated metrics
   pm.collectionVariables.set("metrics", JSON.stringify(metricsArray));
   ```

3. **Export Metrics**:
   Add a request with this script to export metrics to CSV:
   ```javascript
   var metrics = pm.collectionVariables.get("metrics") || "[]";
   var metricsArray = JSON.parse(metrics);
   
   // Convert to CSV
   var csv = "Request ID,Operation Type,JWT Validation Time (ms),DB Query Time (ms),Blockchain Validation Time (ms),Gas Used,Total Processing Time (ms),Status Code,Timestamp\n";
   
   metricsArray.forEach(function(item) {
       csv += [
           item.requestId,
           item.operationType,
           item.jwtValidationTime,
           item.dbQueryTime,
           item.blockchainValidationTime,
           item.gasUsed,
           item.totalProcessingTime,
           item.statusCode,
           item.timestamp
       ].join(",") + "\n";
   });
   
   // Display CSV
   console.log(csv);
   ```

This setup will allow you to efficiently track and analyze the performance metrics of your Blockchain-Auth system while staying within your SepoliaETH budget. 