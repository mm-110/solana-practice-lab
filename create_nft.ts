import {Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
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

const {uri} = await metaplex.nfts().uploadMetadata({
    name: "My First Ever Solana NFT",
    description: "Decription as usual",
    format: "Unusual field to test metadata",
})

console.log(uri);

const {nft} = await metaplex.nfts().create(
    {
        uri: uri,
        name: "My First Ever Solana NFT",
        sellerFeeBasisPoints: 0,
    },
    {
        commitment: "finalized"
    },
);

console.log(nft.address);