import { ChainId } from "@usedapp/core"
import { ethers } from "ethers"
import { JsonRpcProvider } from "@ethersproject/providers"
import { parseEther } from "ethers/lib/utils"

export const BITQUERY_HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.BITQUERY_API_KEY ?? '',
}

export const BITQUERY_GRAPHQL_URL =
    process.env.NEXT_PUBLIC_BITQUERY_API_URL || "https://graphql.bitquery.io"

export const CORS = "cors"

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead"
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const NETWORK_BSC = "bsc"
export const BNBTokenAddress = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
export const ETHTokenAddress = "0x2170ed0880ac9a755fd29b2688956bd959f933f8"
export const BTCTokenAddress = "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"
export const BUSDTokenAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56"
export const USDTTokenAddress = "0x55d398326f99059fF775485246999027B3197955"
export const USDCTokenAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"

export const AppTokenAddress = "0xf1ed6a819ceabc0b8d0d57bfc1bc6ade4eb78585"

export const AppLPAddress = "0x517cd2967ce02deee007b98323b43b6df8087f86"

export const CHAIN_ID_MAP: { [key: ChainId | number]: string } = {
    1: "Ethereum Mainnet",
    3: "Ropsten Test Network",
    4: "Rinkeby Test Network",
    5: "Görli Test Network",
    42: "Kovan Test Network",
    56: "Binance Smart Chain",
    0: "Not Connected",
}

export const CHAIN_ID_NAME_MAP: { [chainId in ChainId]?: string } = {
    [ChainId.Mainnet]: 'Ethereum',
    [ChainId.Rinkeby]: 'Rinkeby',
    [ChainId.BSC]: 'Smart Chain',
    [ChainId.BSCTestnet]: 'Smart Chain Testnet',
    [ChainId.Polygon]: 'Polygon',
    [ChainId.Mumbai]: 'Mumbai',
}

export const HTTP_METHODS: {
    [key: string]: "GET" | "POST" | "PUT" | "DELETE"
} = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
}

export const Rpc_URLS: { [chainId in ChainId]?: string } = {
    [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/b6a2f439eeb57f2c3c4334a6/eth/mainnet',
    [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/b6a2f439eeb57f2c3c4334a6/eth/rinkeby',
    [ChainId.Goerli]: 'https://goerli.infura.io/v3/b6a2f439eeb57f2c3c4334a6/eth/rinkeby',
    [ChainId.BSC]: 'https://bsc-dataseed2.ninicoin.io/',
    [ChainId.BSCTestnet]: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    [ChainId.Polygon]: 'https://polygon-rpc.com/'
}

export const BlockExplorer_URLS: { [chainId in ChainId]?: string } = {
    [ChainId.Mainnet]: 'https://etherscan.io/',
    [ChainId.Rinkeby]: 'https://rinkeby.etherscan.io/',
    [ChainId.Goerli]: 'https://goerli.etherscan.io/',
    [ChainId.BSC]: 'https://bscscan.com/',
    [ChainId.BSCTestnet]: 'https://testnet.bscscan.com',
    [ChainId.Polygon]: 'https://polygonscan.com/'
}

export const Native_Currencies: { [chainId in ChainId]?: any } = {
    [ChainId.Mainnet]: {name: 'Ether', symbol:'ETH', decimals: 18},
    [ChainId.Rinkeby]: {name: 'Ether', symbol:'ETH', decimals: 18},
    [ChainId.Goerli]: {name: 'Ether', symbol:'ETH', decimals: 18},
    [ChainId.BSC]: {name: 'BNB', symbol:'BNB', decimals: 18},
    [ChainId.BSCTestnet]: {name: 'BNB', symbol:'BNB', decimals: 18},
    [ChainId.Polygon]: {name: 'Matic', symbol:'MATIC', decimals: 18}
}

export const RpcProviders: { [chainId in ChainId]?: JsonRpcProvider } = {
    // [ChainId.Mainnet]: new ethers.providers.JsonRpcProvider(Rpc_URLS[ChainId.Mainnet]),
    // [ChainId.Rinkeby]: new ethers.providers.JsonRpcProvider(Rpc_URLS[ChainId.Rinkeby]),
    [ChainId.BSC]: new ethers.providers.JsonRpcProvider(Rpc_URLS[ChainId.BSC]),
    [ChainId.BSCTestnet]: new ethers.providers.JsonRpcProvider(Rpc_URLS[ChainId.BSCTestnet])
}
