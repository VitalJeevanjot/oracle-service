## Oracle 2.0 service Build on Top Of Aeternity Oracles

Oracle 2.0 provides API built on top of Aeternity blockchain Oracle Service to server URL requests. The API provided by Oracle 2.0 is connected to a smart contract which performs the Question/Answer operations and helps to Integrate More features into current Aeternity Oracle system.

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


### Backend
- pagesigner: It is a tool provided by TLS notary developers for notarization (modified according to needs)
- host_encryptr.js: It hosts backend to encrypt queries from fron-end requests
- index.js: To fetch and answer oracle_plain
- index_proof & index_ukey: These scripts have similar work as above, Except process queries differently.

### Fron-end
- Fron-end currently server at https://ae.say.network/ or https://pensive-haibt-8363c5.netlify.app/#/
- 
Which encrypts the url with API key or secret or any url that you want to hide while requesting.

![image](https://user-images.githubusercontent.com/40867747/117509532-05b44980-afa8-11eb-9e72-2b0f6556e4bf.png)
![image](https://user-images.githubusercontent.com/40867747/117509555-15cc2900-afa8-11eb-88de-8b4424d562b7.png)





