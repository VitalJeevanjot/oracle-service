## Oracle 2.0 service Build on Top Of Aeternity Oracles

Project have 3 seperate Ends:

- [Smart contracts](https://github.com/genievot/oracle-service/tree/main/contracts)
- [Backend](https://github.com/genievot/oracle-service/tree/main/backend)
- [Front-end](https://github.com/genievot/oracle-service/tree/main/spa)

### Smart Contracts

- /libs/Say.aes = It is an API that provides Oracle 2.0 service on consumer smart contracts.
- MyContract.aes = Example contract for consumers to ask queries and responses
- MyContractProof.aes = Example contract for consumers to ask queries and get responses with proofs from Oracle 2.0
- MyContractUkey.aes = Example contract for encrypted queries (If url contains API Key/Secret, then use this method) and get responses
- OracleAddressResolver.aes = It resolves the Address of the Oracle Connector and also keeps the choice of the Consumer contract for future queries.
- OracleConnector.aes = Connectors contracts are the last end of any queries, Any query called form consumer contract executes here and emit appropriate data for nodes to fetch query and provide response.
- merged.aes = This is sample contract for consumer, If you like to try editors where include Say.aes won't work. This will merge code from API library and consumer contract.


**Scripts**
- Deploy Script: It merges and deploy merged.aes for demo purposes
- Scripts/getQuery.js: It is multi purpose script (Form bytes to fetch query) for test purposes.


