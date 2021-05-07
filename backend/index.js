// For encrypted queries
const requireESM = require('esm')(module);
const fs = require('fs');
const { Universal, Node, MemoryAccount, ContractACI } = require('@aeternity/aepp-sdk');
const { decodeEvents, SOPHIA_TYPES } = requireESM('@aeternity/aepp-sdk/es/contract/aci/transformation');

// import { parseBigNumber, asBigNumber, isBigNumber, ceil } from '@aeternity/aepp-sdk/es/utils/bignumber'
const OracleContractCode = fs.readFileSync(__dirname + '/../contracts/OracleConnector.aes', 'utf-8');
// oracle_plain
const contract_address = "ct_2ZoDc2KTvJ1QiGdBwAvgxzhWgWgzZi6daxC18buXzrxbEuVS7u"
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

}
initNode()

async function fullFillQuery (query_id) {
  let query = await contract.methods.get_query_address(query_id)
  console.log(query.decodedResult)

  let question = await contract.methods.get_question(query.decodedResult)
  console.log(question.decodedResult)

  // var lat_long = question.decodedResult.split(",")
  // axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat_long[0]}&lon=${lat_long[1]}&appid=${conf.weather_key}`).then(async (res) => {
  //   let response = await contract.methods.respond(query.decodedResult, res.data.main.temp.toString())
  //   console.log(response)
  // })

}

// websocket listening...
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();
function connect () {
  client.connect(`wss://testnet.aeternity.io/mdw/websocket`);
}
connect()

client.on('connectFailed', function (error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', (connection) => {
  console.log("connected at: " + new Date())
  console.log('WebSocket Client Connected');

  connection.send(JSON.stringify({
    op: "Subscribe",
    payload: "Object",
    target: contract_address.replace(/^.{2}/g, 'ok')
  }));
  connection.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', () => {
    console.log("closed at: " + new Date())
    connect()
  });


  const eventsSchema = [
    { name: 'QueryCreated', types: [SOPHIA_TYPES.oracle, SOPHIA_TYPES.bytes, SOPHIA_TYPES.int, SOPHIA_TYPES.string] }
  ]

  connection.on('message', async (message) => {
    if (message.type === 'utf8' && message.utf8Data.includes("payload")) {
      var dataToDecode = null
      if (message.utf8Data !== "connected") {
        dataToDecode = JSON.parse(message.utf8Data)
        if (dataToDecode.payload) {
          var hash = dataToDecode.payload.hash
          console.log(hash)
          axios.get(`https://testnet.aeternity.io/v2/transactions/${hash}/info`).then(async (res, err) => {
            if (err) {
              console.log("Err: ")
              console.log(err)
              console.log(" :Err END ")
              return
            }
            let result = res.data.call_info
            // console.log(result)
            let result_args = result.log[0].data
            let result_query = result.log[0].topics[2]
            let result_timestamp = result.log[0].topics[3]
            console.log(decodeEvents(result.log, { schema: eventsSchema }))
            console.log(result_args)
            console.log(result_query)
            console.log(result_timestamp)
            // console.log(result_args.decodedResult)
            // console.log(result_query.decodedResult.toString())
            // let response = await contract.methods.respond(query.decodedResult, res.data.main.temp.toString())
            // console.log(response.decodedResult)

          })
        }
      }
      else {
        console.log("--- Other Data ---")
        console.log(message.utf8Data)
        console.log("--- Other Data End ---")
      }
    }
  });
});



// Decoding functions...



// const SOPHIA_TYPES = [
//   'int',
//   'string',
//   'tuple',
//   'address',
//   'bool',
//   'list',
//   'map',
//   'record',
//   'option',
//   'oracle',
//   'oracleQuery',
//   'hash',
//   'signature',
//   'bytes',
//   'variant'
// ].reduce((acc, type) => ({ ...acc, [type]: type }), { ChainTtl: 'Chain.ttl' })

// function decodeEvents (events, options = { schema: [] }) {
//   if (!events.length) return []

//   return events.map(l => {
//     const [eName, ...eParams] = l.topics
//     const hexHash = toBytes(eName, true).toString('hex')
//     const { schema } = options.schema
//       .reduce(
//         (acc, el) => {
//           if (hash(el.name).toString('hex') === hexHash) {
//             l.name = el.name
//             return {
//               schema: el.types,
//               name: el.name
//             }
//           }
//           return acc
//         },
//         { schema: [] }
//       )
//     const { decoded } = schema.reduce((acc, el) => {
//       if (el === SOPHIA_TYPES.string) {
//         return { decoded: [...acc.decoded, transformEvent(l.data, el)], params: acc.params }
//       }
//       const [event, ...tail] = acc.params
//       return { decoded: [...acc.decoded, transformEvent(event, el)], params: tail }
//     }, { decoded: [], params: eParams })

//     return {
//       ...l,
//       decoded
//     }
//   })
// }

// function bigNumberToByteArray (x) {
//   if (!x.isInteger()) throw new Error(`Unexpected not integer value: ${x.toFixed()}`)
//   let hexString = x.toString(16)
//   if (hexString.length % 2 > 0) hexString = '0' + hexString
//   return Buffer.from(hexString, 'hex')
// }

// function toBytes (val, big = false) {
//   // """
//   // Encode a value to bytes.
//   // If the value is an int it will be encoded as bytes big endian
//   // Raises ValueError if the input is not an int or string

//   if (val === undefined || val === null) return Buffer.from([])
//   if (Number.isInteger(val) || BigNumber.isBigNumber(val) || big) {
//     if (!BigNumber.isBigNumber(val)) val = BigNumber(val)
//     return bigNumberToByteArray(val)
//   }
//   if (typeof val === 'string') {
//     return val.toString('utf-8')
//   }
//   throw new Error('Byte serialization not supported')
// }

