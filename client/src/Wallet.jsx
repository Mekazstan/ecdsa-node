import server from "./server";

import * as secp from 'ethereum-cryptography/secp256k1'
import { toHex } from 'ethereum-cryptography/utils.js';
import Web3 from 'web3';
const web3 = new Web3();

// Here the client enters their private key which is then converted to private key and use to retrieve balance  


function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  function convertToEthereumAddress(publicKey) {
    const publicKeyHash = web3.utils.sha3(publicKey);
    const address = '0x' + publicKeyHash.slice(26).toLowerCase();
    return address;
  }

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = convertToEthereumAddress(toHex(secp.getPublicKey(privateKey)));
    setAddress(address);
    console.log(address)
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Input your private key..." value={privateKey} onChange={onChange}></input>
      </label>

      <div>
        <label>Public Key:</label>
        Address: {address}<br />
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
