import * as web3 from '@solana/web3.js';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import "dotenv/config";

// Function to encrypt a message using the recipient's public key
export function encryptWithPublicKey(publicKey, message) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const keyPair = nacl.box.keyPair();
  const sharedSecret = nacl.box.before(publicKey, keyPair.secretKey);

  const encryptedMessage = nacl.box.after(
    naclUtil.decodeUTF8(message),
    nonce,
    sharedSecret
  );

  return {
    ciphertext: naclUtil.encodeBase64(encryptedMessage),
    nonce: naclUtil.encodeBase64(nonce),
    ephemeralPublicKey: naclUtil.encodeBase64(keyPair.publicKey),
  };
}

// Function to decrypt a message using the recipient's private key
export function decryptWithPrivateKey(privateKey, encryptedMessage) {
  const nonce = naclUtil.decodeBase64(encryptedMessage.nonce);
  const ephemeralPublicKey = naclUtil.decodeBase64(encryptedMessage.ephemeralPublicKey);
  const ciphertext = naclUtil.decodeBase64(encryptedMessage.ciphertext);

  const sharedSecret = nacl.box.before(ephemeralPublicKey, privateKey);
  const decryptedMessage = nacl.box.open.after(ciphertext, nonce, sharedSecret);

  if (!decryptedMessage) {
    throw new Error('Decryption failed');
  }

  return naclUtil.encodeUTF8(decryptedMessage);
}