import {Metaplex, keypairIdentity, bundlrStorage, PublicKey } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


const connection = new Connection(clusterApiUrl("devnet"));
const wallet = getKeypairFromEnvironment("SECRET_KEY");

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );
const mintAddress = new PublicKey("6vyDQfgoZKdZzJsst61F5UciRNQQv8yuEdcDSB6rnxEw")
const nft = await metaplex.nfts().findByMint({mintAddress});
console.log(nft.uri);

fetch(nft.uri)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Errore:', error));