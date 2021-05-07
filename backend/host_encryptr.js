require('dotenv').config() // for secret key
const Cryptr = require('cryptr');

var cors = require('cors')

console.log(process.env.SECRET_KEY)

const cryptr = new Cryptr(process.env.SECRET_KEY);

const express = require('express')

var bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


app.get('/get_encrypted_query', (req, res) => {
  console.log(req.query)
  let encrypted_query = cryptr.encrypt(req.query.text);
  res.send(encrypted_query)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})