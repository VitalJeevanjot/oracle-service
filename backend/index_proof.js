// For encrypted queries
const requireESM = require('esm')(module);
const fs = require('fs');
const web3 = require('web3');
const pgsg = require('./pagesigner/webextension/content/pgsg-node/pgsg-node');
var path_ = require('path')
const { Universal, Node, MemoryAccount, ContractACI } = require('@aeternity/aepp-sdk');
const { decodeEvents, SOPHIA_TYPES } = requireESM('@aeternity/aepp-sdk/es/contract/aci/transformation');
// query example: https://api.pro.coinbase.com/products/ETH-USD/ticker,price
// import { parseBigNumber, asBigNumber, isBigNumber, ceil } from '@aeternity/aepp-sdk/es/utils/bignumber'
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
// oracle_plain
const contract_address = "ct_2m6mJzrPgrfynFcxhDx33iZRqRjkke1unfRrhjBBfyEbpQZkiK"
var blake2b = require('blake2b')
var axios = require('axios')
var url = "https://testnet.aeternity.io/"
var processedIndex = 0
var Compilerurl = "https://testnet.aeternity.io/"
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

        let result = await getResultWithTLSProof(_getQueryQuestion)
        console.log("result:- " + result)
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

async function getResultWithTLSProof (_args) {
  let args = _args.split(',')
  try {
    await axios.get(args[0])
  }
  catch (err) {
    console.log("ERR ========")
    console.log(err.message)
    console.log("ERR END ========")
    return "ERR:URL"
  }
  console.log("args: " + args)
  const myURL = new URL(args[0]);

  const host = myURL.host
  const path = myURL.pathname

  console.log("WITH TLS Notary Proof")
  var headers = `GET ${path} HTTP/1.1\naccept: application/json\nHost: ${host}\n\n`
  console.log(headers)
  var response_dir = await pgsg.main(["notarize", host, headers])
  const dirpath = path_.join("./pagesigner/webextension/content/pgsg-node", response_dir)

  var targetFiles = null;
  console.log("------------------------")
  console.log("dirpath: " + dirpath)
  console.log("------------------------")
  var targetFiles = fs.readdirSync(dirpath)
  const pgsgFile = targetFiles.filter(el => path_.extname(el) === '.pgsg')

  var response_verified_dir = await pgsg.main(["verify", response_dir + `/` + pgsgFile])
  console.log("response_verified_dir: " + response_verified_dir)
  const dirpath_verified = path_.join("./pagesigner/webextension/content/pgsg-node", response_verified_dir)
  console.log("dirpath_verified: " + dirpath_verified)
  var clear_text = fs.readFileSync(path_.join(dirpath_verified, "cleartext")).toString()
  var pgsg_proof = fs.readFileSync(dirpath_verified + "/" + pgsgFile).toString()

  var result_array = clear_text.split("\r\n\r\n")
  console.log(result_array)
  var result_json = null
  try {
    result_json = JSON.parse(result_array[1].toString())
  }
  catch (err) {
    console.log("ERR ========")
    console.log(err.message)
    console.log("ERR END ========")
  }
  for (let index = 1; index < args.length; index++) { // nested results
    result_json = result_json[args[index]]
  }
  console.log("result: " + result_json)
  console.log("\n\nproof: " + pgsg_proof)
  var proof_in_bytes = web3.utils.toHex(pgsg_proof)
  console.log("\n\nproof in Bytes: " + proof_in_bytes)
  return `${result_json},${proof_in_bytes}`

}