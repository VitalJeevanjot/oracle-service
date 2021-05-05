const fs = require('fs');
const { Universal, Node, MemoryAccount } = require('@aeternity/aepp-sdk');
// import { parseBigNumber, asBigNumber, isBigNumber, ceil } from '@aeternity/aepp-sdk/es/utils/bignumber'
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
const contract_address = "ct_2LCaoee9ZV9Yqsnv5pfgwACiFHagAxwgC7DNHnSEwBdiGV4Lg6"
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
var client = null
var contract = null
async function initNode () {
  client = await Universal({
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
  contract = await client.getContractInstance(OracleContractCode, { contractAddress: contract_address })

}
initNode()

async function fullFillQuery (query_id) {
  let query = await contract.methods.get_query_address(query_id)
  console.log(query.decodedResult)

  let question = await contract.methods.get_question(query.decodedResult)
  console.log(question.decodedResult)

  var lat_long = question.decodedResult.split(",")
  axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat_long[0]}&lon=${lat_long[1]}&appid=${conf.weather_key}`).then(async (res) => {
    let response = await contract.methods.respond(query.decodedResult, res.data.main.temp.toString())
    console.log(response)
  })

}



// websocket listening...
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function (error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function () {
    console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      // console.log("Received: '" + message.utf8Data + "'");
      var dataToDecode = null
      if (message.utf8Data !== "connected") {
        dataToDecode = JSON.parse(message.utf8Data)
        if (dataToDecode.payload) {
          var hash = dataToDecode.payload.hash
          axios.get(`https://testnet.aeternity.io/v2/transactions/${hash}/info`).then((res) => {

            if (res.data.call_info.log.length > 0) {
              var current_query_index = res.data.call_info.log[0].topics[1]
              if (processedIndex !== current_query_index) {
                fullFillQuery(current_query_index)
                processedIndex = current_query_index
              }
            }
          })
        }
      }
      else {
        console.log(message.utf8Data)
      }
    }
  });
  function sendSubscriptionRequest () {
    if (connection.connected) {
      connection.sendUTF(`{"op":"Subscribe",  "payload": "Object", "target":"${contract_address}"}`);
    }
  }
  sendSubscriptionRequest();
});

client.connect(`wss://testnet.aeternal.io/websocket`);