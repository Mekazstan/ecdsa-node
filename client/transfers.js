import { keccak256 } from 'ethereum-cryptography/keccak.js';
import { utf8ToBytes } from 'ethereum-cryptography/utils.js';
import secp from 'ethereum-cryptography/secp256k1.js';


// 3
// async function recoverKey(message, signature, recoveryBit) {
//     const hash = hashMessage(message);
//     const publicKey = await secp.recoverPublicKey(hash, signature, recoveryBit);
//     return publicKey;
// }



async function signMessage(message, privateKey) {
    try {
        // Hash the message 
        const bytes = utf8ToBytes(message);
        const messageHash = keccak256(bytes);
        const publicKey = secp.getPublicKey(privateKey);

        // Sign the message
        const signature = await secp.sign(messageHash, privateKey, { recovered: true });

        // Verify the signature
        const isSigned = secp.verify(signature, messageHash, publicKey);
        if (isSigned) {
            return signature;
        } else {
            throw new Error('Signature verification failed');
        }
    } catch (error) {
        console.error("Error: Message not signed", error);
        throw error;
    }
}

signMessage('message0', '99e1e8c468feb8a3a418bc43590b53b4f444be5ded72ecaf7ed39b216152ccc1')
    .then(signature => {
        console.log(signature);
    })
    .catch(error => {
        console.error(error);
    });


export { signMessage };