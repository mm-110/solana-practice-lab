import * as web3 from '@solana/web3.js';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

// Get the Solana keypair from the environment variable
const wallet = getKeypairFromEnvironment("SECRET_KEY");

// Ensure the secret key is 32 bytes (ED25519 key pair)
const secretKey = new Uint8Array(wallet.secretKey);
if (secretKey.length !== 64) {
  throw new Error('Invalid secret key length, expected 64 bytes for ED25519 key pair');
}
const ed25519Seed = secretKey.slice(0, 32);

// Convert ED25519 to X25519 for key exchange
const ed25519ToX25519 = (edKey) => {
  const keyPair = nacl.sign.keyPair.fromSeed(edKey);
  return keyPair.secretKey.slice(0, 32);
};

// Get the public and private keys for X25519
const x25519PrivateKey = ed25519ToX25519(ed25519Seed);
const x25519PublicKey = nacl.scalarMult.base(x25519PrivateKey);

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

// Now you can use the encryption and decryption functions
const originalMessage = 'Questo è uno scherzo';
const encryptedMessage = encryptWithPublicKey(x25519PublicKey, originalMessage);
const decryptedMessage = decryptWithPrivateKey(x25519PrivateKey, encryptedMessage);

console.log('Messaggio originale:', originalMessage);
console.log('Messaggio criptato:', encryptedMessage.ciphertext);
console.log('Messaggio decriptato:', decryptedMessage);
