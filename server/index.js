const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042; // Listening port for the server
const Web3 = require('web3');
const web3 = new Web3();

const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());


function convertToEthereumAddress(publicKey) {
  const publicKeyHash = web3.utils.sha3(publicKey);
  const address = '0x' + publicKeyHash.slice(26).toLowerCase();
  return address;
}

// Available addresses and their balances
const balances = {
  // "0x1": 100, 99e1e8c468feb8a3a418bc43590b53b4f444be5ded72ecaf7ed39b216152ccc1
  // "0x2": 50, a9d12bd5fd614455806c4de868ceeaaa3449d2b54568cb011d4ee294cf5baa8f
  // "0x3": 75, 6fb60a9792fa421f454993a9da98f5d4e1d7b0e3f4f69fe018fcbceba1c72153
  "0xcf7b0d9da33545bfdb8220b61ff40cd749f61118": 100,
  "0xf7e73322b7762cc04bed2d664e4b591179a88eb2": 50,
  "0xac3a984d4bda0cb71d99671b94ddf256f88adb9c": 75
  // "04bbeccab71a8779be3780db5e724303c41f09496a29f733c2958f3ce8978b16f211f1a712478019296e9e3c35171bf18d8314a96e6cc470139d99846b78bc6033": 100,
  // "046471f84b01b5b279f6efb248c7f637b2897091ed920eacce05e3f82953d3deaf063389ef6c6dc8549e309502c0948850b0eb36f22e283ab14a01c501543ffe57": 50,
  // "045a71f876db5241e665aba5587e2287f11f2969520bab0d928301b0dd5e7e24dd90efac4c417cce31044d374a92d7a69a7a2a9544175f8caec81a34388b10c533": 75,

};

// Route endpoint for checking the balance of an address using a GET request to the /balance/:address endpoint.
// If the address is not found, the balance is returned as 0az1W1QQ
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

// endpoint for sending cryptocurrency using a POST request to the /send endpoint with a JSON payload that includes the sender, reciever, and amount parameters.

app.post("/send", (req, res) => {
  const { sender, amount, reciever, signature } = req.body;
  //console.log("req.body=",req.body);

  setInitialBalance(sender);
  setInitialBalance(reciever);

  // Convert message to byte and hash the message
  const messageInBytes = utf8ToBytes(reciever);
  //console.log(messageInBytes);
  const keccakHash = keccak256(messageInBytes); 
  //console.log(keccakHash);   
  
  // Convert the signature to Uint8Array (needed after sending, thanks shyanukant!)
  const formattedSignature = Uint8Array.from(Object.values(signature[0]))
  //console.log(formattedSignature);
 
  // Now recovering the public Key in the server... 
  const publicKeyRecovered = secp.recoverPublicKey(keccakHash, formattedSignature, signature[1]);
  //console.log(publicKeyRecovered);

  // Verify the message
  const verification = secp.verify(formattedSignature, keccakHash, publicKeyRecovered);
  console.log(verification)

  if (!verification) {
    res.status(400).send({ message: "Signature Not Verified!" });
  }
  else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[reciever] += amount;
    res.send({ balance: balances[sender], message: "Transfer successful" });
  }
});

// starts the Express app by listening on the specified port
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

// Function to create account if not existing
function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
