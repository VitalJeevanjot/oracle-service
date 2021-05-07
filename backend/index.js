// For encrypted queries
const requireESM = require('esm')(module);
const fs = require('fs');
const { Universal, Node, MemoryAccount, ContractACI } = require('@aeternity/aepp-sdk');
const { decodeEvents, SOPHIA_TYPES } = requireESM('@aeternity/aepp-sdk/es/contract/aci/transformation');

// import { parseBigNumber, asBigNumber, isBigNumber, ceil } from '@aeternity/aepp-sdk/es/utils/bignumber'
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
// oracle_plain
const contract_address = "ct_2uEWFtsqEhErztjthHrt1UD5QPLAfnpWjDbYUN6FAT5aVZGyUd"
var blake2b = require('blake2b')
var axios = require('axios')
var url = "https://sdk-testnet.aepps.com"
var processedIndex = 0
var Compilerurl = "https://sdk-testnet.aepps.com"
const BigNumber = require('bignumber.js');
const conf = require('./conf.json')

const keyPair = {
  "publicKey": "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
  "secretKey": "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
}
var client_node = null
var contract = null


var queries = null;

async function initNode () {
  client_node = await Universal({
    nodes: [
      {
        name: 'node',
        instance: await Node({
          url: url,
          internalUrl: url,
        }),
      }],
    accounts: [MemoryAccount({ keypair: keyPair })],
    compilerUrl: "https://latest.compiler.aepps.com"
  });

  contract = await client_node.getContractInstance(OracleContractCode, { contractAddress: contract_address })
  contract = await client_node.getContractInstance(OracleContractCode, { contractAddress: contract_address })

  let getNumberOfQueries = await contract.methods.getIndexOfQueries()
  queries = getNumberOfQueries.decodedResult

  console.log("Queries: " + queries)

  StartListening()
}
initNode()

async function StartListening () {
  async function getQueries () {
    let getNumberOfQueries = await contract.methods.getIndexOfQueries() // starting form 0
    let _getNumberOfQueries = getNumberOfQueries.decodedResult
    console.log("getNumberOfQueries: " + _getNumberOfQueries)

    if (_getNumberOfQueries > queries) {
      for (let index = queries + 1; index <= _getNumberOfQueries; index++) {
        console.log(index + " ===> ")

        let getQuery = await contract.methods.getQueryByNumber(index)
        let _getQuery = getQuery.decodedResult
        console.log("getQuery: " + _getQuery)

        let getQueryQuestion = await contract.methods.getQuestionByQuery(_getQuery)
        let _getQueryQuestion = getQueryQuestion.decodedResult
        console.log("getQueryQuestion: " + _getQueryQuestion)

        let result = await getResult(_getQueryQuestion)
        console.log("result " + result)
        let respondToQuery = await contract.methods.respond(_getQuery, result.toString())
        let _respondToQuery = respondToQuery.decodedResult
        console.log("respondToQuery: " + _respondToQuery)



        queries++
      }
    }
    getQueries()
  }
  getQueries()
  // setInterval(getQueries, 10000);
}
// 
async function getResult (_args) {
  let args = _args.split(',')
  var response = null
  try {
    response = await axios.get(args[0])
  }
  catch (err) {
    console.log("ERR ========")
    console.log(err.message)
    console.log("ERR END ========")
    return "ERR:URL"
  }

  var result = response.data
  for (let index = 1; index < args.length; index++) { // nested results
    result = result[args[index]]
  }
  console.log("result: " + result)
  return result
}