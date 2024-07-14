# Bitcoin Liquid Paper Wallet Generator
Paper wallet solution for the Bitcoin Liquid Sidechain based on Typescript + Vite.  
It generates Native Segwit addresse for Liquid Sidechain, we tested our wallets on  
1. Green Wallet by Blockstream
2. Marina Wallet by Vulpem Ventures

## <u><b>OFFLINE usage is suggested for enhanced security.</b></u>

# Dependencies
1. `@bitcoinerlab/secp256k1` elliptic curve operations on the secp256k1 curve
2. `@esbuild-plugins/node-globals-polyfill` support for node libraries inside the browser
3. `bip32` and `bip39` for keys and seed management
4. `buffer-es` Buffer usage inside the browser
6. `liquidjs-lib` for the core of the project
7. `slip77` for the generation of deterministic blinding key for confidential transactions  

# Usage from source
`npm i`  
`npm run dev`

## Build
`npm i`  
`npm run build`

# License
GNU General Public License v3.0 or later  
See [COPYING](COPYING.txt) to see the full text.