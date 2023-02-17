import { useState } from "react";
import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1'
import {keccak256} from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // Goal: To create a message & signature to be verified on the server
  // Avoid sending the private key to the server
  async function transfer(evt) {
    evt.preventDefault();
  
    // Converting message to byte
    const reciever = recipient; 
    const messageInBytes = utf8ToBytes(reciever);
    console.log("messageInBytes=" + messageInBytes);

    // Hashing the message
    const keccakHash = keccak256(messageInBytes);
    console.log("keccakHash=" + keccakHash);

    // Signing the message with a private key
    // NOTE: signature = [ digSign, recoveryBit ]
    let signature = await secp.sign(keccakHash, privateKey, { recovered: true } );
    console.log("signature=" + signature);

    // Just for Testing Public Key recovery & Verifying signing
    // const publicKeyRecovered = secp.recoverPublicKey(keccakHash, signature[0], signature[1]);
    // console.log("publicKeyRecovered=" + toHex(publicKeyRecovered));
    
    // verifying 
    // const verification  = secp.verify(signature[0], keccakHash, address);
    // const verification2 = secp.verify(signature[0], keccakHash, publicKeyRecovered); //without toHex()
    
    // console.log("verification=", verification);
    // console.log("verification2=", verification2);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),     
        reciever,  /* send msg (in a string) and signature, both needed to verify */
        signature,            
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
