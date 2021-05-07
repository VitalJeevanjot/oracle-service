const fs = require('fs');
const { Universal, Node, MemoryAccount, Crypto } = require('@aeternity/aepp-sdk');
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
const contract_address = "ct_2uEWFtsqEhErztjthHrt1UD5QPLAfnpWjDbYUN6FAT5aVZGyUd";
var url = "https://sdk-testnet.aepps.com"
var processedIndex = 0
var Compilerurl = "https://sdk-testnet.aepps.com"
const BigNumber = require('bignumber.js');
require('dotenv').config()

// console.log()

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

  // createOracle()
  getQuery()

}
initNode()

async function createOracle () {
  const buf7 = Buffer.from('oracle_plain', 'latin1').toString('hex');
  console.log(buf7)

  var arr = []
  for (let index = 0; index < 64; index = index + 2) {
    if (buf7[index] == undefined) {
      arr.push("x" + 00)
      continue
    }
    const element = buf7[index].toString(16);
    const element2 = buf7[index + 1].toString(16);
    arr.push("x" + element + element2)
  }
  console.log(arr)
  const keypair = Crypto.generateKeyPair()
  console.log(keypair.publicKey)
  let oracle = await contract.methods.createOracle(arr, keypair.publicKey)
  console.log(oracle.decodedResult)

  arr = []
  for (let index = 0; index < 64; index = index + 2) {
    if (oracle.decodedResult[index] == undefined) {
      arr.push("x" + 00)
      continue
    }
    const element = oracle.decodedResult[index].toString(16);
    const element2 = oracle.decodedResult[index + 1].toString(16);
    arr.push("x" + element + element2)
  }
  console.log(arr)

  let oracle_address = await contract.methods.oracleById(arr)
  console.log(oracle_address.decodedResult)

}


async function getQuery () {
  arr = []
  decodedResult = "ba2cbaf115595fe643d708a4626bc823b489f38a9c504df88d33a4d14e71d421"
  for (let index = 0; index < 64; index = index + 2) {
    if (decodedResult[index] == undefined) {
      arr.push("0x" + 00)
      continue
    }
    const element = decodedResult[index].toString(16);
    const element2 = decodedResult[index + 1].toString(16);
    arr.push("0x" + element + element2)
  }
  console.log(arr)

  let oracle_address = await contract.methods.getQuery(arr)
  console.log(oracle_address.decodedResult)

}
// createOracle()



