/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const Deployer = require('aeproject-lib').Deployer;
var fs = require('fs');

const Say = `
namespace Saydummy =
    public function dummy() : bool =
        true

contract OracleConnector =
    entrypoint createOracle : (bytes(32), int, int) => bool
    entrypoint query: (string) => bytes(32)
    entrypoint canCallBack: () => bool

contract OracleAddressResolver =
    entrypoint getAddress : () => address

namespace Say =
    public function getOracleAddress() : address =
        let ar : OracleAddressResolver = ct_xRAL2ZaqffbTAeQrAunrR8jxdg9YbJvuEnFFJC8g8oW4LJ7Um
        ar.getAddress()

    public function canCallBack() : bool =
        let ar : OracleConnector = Address.to_contract(getOracleAddress())
        ar.canCallBack()


contract Boolean =
  record boolean = {
    ok: bool
   }

`

const deploy = async (network, privateKey, compiler, networkId) => {
    let deployer = new Deployer(network, privateKey, compiler, networkId)
    console.log(deployer)
    // Concat the Library with contract and send.
    let file_content = fs.readFileSync('./contracts/MyContract.aes')
    let merged_contract = Say + file_content.toString().split("\n").slice(1).join("\n")
    // console.log(merged_contract)
    fs.writeFileSync('./contracts/merged.aes', merged_contract)


    await deployer.deploy("./contracts/merged.aes")
};

module.exports = {
    deploy
};