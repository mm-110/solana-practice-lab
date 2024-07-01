import {Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import fs from 'fs';
import { encryptWithPassword } from "./encrypt";

// Ho problemi con bundlrStorage
// Ho che bundlr was renamed to irys in "@metaplex-foundation/js" 0.19.6
// You'll have to use irysStorage instead of bundlrStorage, and irys.xyz instead of bundlr.network


const connection = new Connection(clusterApiUrl("devnet"));
const wallet = getKeypairFromEnvironment("SECRET_KEY");
// Here we have to get the password
const password = "aaaa"

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
        irysStorage({
            address: "https://devnet.irys.xyz",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );

// Function to ecnrypt JSON data
const encryptJsonData = (data, password) => {
    const encryptedData = {};
    for (const key in data) {
        encryptedData[key] = encryptWithPassword(data[key], password);
    }
    return encryptedData;
};

// Import the data in json format
const rawData = fs.readFileSync("./test_data/items.json", 'utf8');
const jsonData = JSON.parse(rawData);
// Extract the name of the NFT from JSON data
const nftName = jsonData.name;
// Remove the name property from the JSON data to avoid duplicate metadata fields
delete jsonData.name;
// Encrypt the JSON data
const encryptedJsonData = encryptJsonData(jsonData, password)
// Create NFT's metadata
const {uri} = await metaplex.nfts().uploadMetadata(encryptedJsonData)
console.log(uri);
// Create NFT
const {nft} = await metaplex.nfts().create(
    {
        uri: uri,
        name: nftName,
        sellerFeeBasisPoints: 0,
    },
    {
        commitment: "confirmed"
    },
);

console.log(nft.address);