const fs = require('fs');
const { Universal, Node, MemoryAccount } = require('@aeternity/aepp-sdk');
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
const contract_address = "ct_67qYA5GtH3Z1eBhXoxf9RWZ1UrsTbFLcGRxRn6HWH9sgi4fuj";
var url = "https://sdk-testnet.aepps.com"
var processedIndex = 0
var Compilerurl = "https://sdk-testnet.aepps.com"
const BigNumber = require('bignumber.js');
require('dotenv').config()

console.log()

const keyPair = {
  "publicKey": process.env.PUBLIC_KEY,
  "secretKey": process.env.PRIVATE_KEY
}
var client = null
var contract = null
async function initNode () {
  client = await Universal({
    nodes: [
      {
        name: 'nodey',
        instance: await Node({
          url: url,
          internalUrl: url,
        }),
      }],
    accounts: [MemoryAccount({ keypair: keyPair })],
    compilerUrl: "https://latest.compiler.aepps.com"
  });
  contract = await client.getContractInstance(OracleContractCode, { contractAddress: contract_address })

  createOracle()
}
initNode()

async function createOracle () {
  const buf7 = Buffer.from('oracle_plain', 'latin1').toString('hex');
  console.log(buf7)

  var arr = []
  for (let index = 0; index < 64; index = index + 2) {
    if (buf7[index] == undefined) {
      arr.push("0x" + 00)
      continue
    }
    const element = buf7[index].toString(16);
    const element2 = buf7[index + 1].toString(16);
    arr.push("0x" + element + element2)
  }
  console.log(arr)
  let query = await contract.methods.createOracle(["x1", "0x1", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa", "0xa"])
  console.log(query.decodedResult)

}
// createOracle()



