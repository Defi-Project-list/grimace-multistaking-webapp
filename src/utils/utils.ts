import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers'

import { AddressZero } from '@ethersproject/constants'
import { BigNumber, ethers, utils } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { ChainId } from "@usedapp/core"
import { DEAD_ADDRESS, RpcProviders, ZERO_ADDRESS } from '@app/constants/AppConstants'
import { formatUnits, parseUnits } from '@ethersproject/units'

enum NETWORK_NAME {
    Ethereum = 'ethereum',
    BSC = 'bsc',
    Polygon = 'polygon'
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
    if (value) {
        try {
            return getAddress(value)
        } catch (e) {
            return false
        }
    }
    return false
}

export function getEtherscanLink(
    chainId: number,
    data: string,
    type: string
): string {
    let prefix = `https://etherscan.io`
    if (chainId === ChainId.Rinkeby) {
        prefix = `https://rinkeby.etherscan.io`
    }
    if (chainId === ChainId.BSCTestnet) {
        prefix = `https://testnet.bscscan.com`
    }
    if (chainId === ChainId.BSC) {
        prefix = `https://bscscan.com`
    }
    if (chainId === ChainId.Polygon) {
        prefix = `https://polygonscan.com`
    }
    switch (type) {
        case 'transaction': {
            return `${prefix}/tx/${data}`
        }
        case 'token': {
            return `${prefix}/token/${data}`
        }
        case 'block': {
            return `${prefix}/block/${data}`
        }
        case 'address':
        default: {
            return `${prefix}/address/${data}`
        }
    }
}

export function calculateGasMargin(value: BigNumber): BigNumber {
    // return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
    return value.mul(BigNumber.from(2))
}

export function shortenAddress(address: string, chars = 4): string {
    const parsed = isAddress(address)
    if (!parsed) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    return `${parsed.substring(0, chars + 3)}...${parsed.substring(42 - chars)}`
}

export function getSigner(library: JsonRpcProvider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

export function getProviderOrSigner(library: JsonRpcProvider, account?: string): JsonRpcProvider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: any, library: JsonRpcProvider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }    
    return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export const wait = (time: number) =>
    new Promise(resolve => {
        setTimeout(resolve, time)
    })

export const formatEther = (amount: BigNumber, decimals: number = 18, toFixed: number, groupSeparator: boolean): string => {
    let res
    if (toFixed >= decimals) {
        res = ethers.FixedNumber.fromString(utils.formatUnits(amount, decimals)).toString()
    } else {
        let fixed = ethers.FixedNumber.fromString(utils.formatUnits(BigNumber.from(10).pow(toFixed), 0))
        res = ethers.FixedNumber.fromString(utils.formatUnits(amount, decimals - toFixed)).floor().divUnsafe(fixed).toString()
    }
    if (res.substring(res.length - 2, res.length) === '.0') {
        res = res.substring(0, res.length - 2)
    }
    if (groupSeparator) {
        res = utils.commify(res)
    }

    return res
}

export const parseEther = (n: string, decimals: number = 18): BigNumber => {
    return utils.parseUnits(n, decimals)
}

export const getChainIdFromName = (name: string): number => {
    let chainId = 1
    switch (name.toLowerCase()) {
        case NETWORK_NAME.Ethereum:
            if (process.env.network === 'mainnet') chainId = 1 //ethereum mainnet
            else if (process.env.network === 'testnet') chainId = 4 //ethereum rinkeby
            break
        case NETWORK_NAME.BSC:
            if (process.env.network === 'mainnet') chainId = 56 //bsc mainnet
            else if (process.env.network === 'testnet') chainId = 97 //bsc testnet            
            break
        case NETWORK_NAME.Polygon:
            if (process.env.network === 'mainnet') chainId = 137 //polygon mainnet
            else if (process.env.network === 'testnet') chainId = 80001 //mumbai testnet            
            break
        default:
            if (process.env.network === 'mainnet') chainId = 56 //bsc mainnet
            else if (process.env.network === 'testnet') chainId = 97 //bsc testnet            
    }
    return chainId
}

export const getNativeSymbol = (name: string): string => {
    let symbol = 'BNB'
    switch (name.toLowerCase()) {
        case NETWORK_NAME.Ethereum:
            symbol = "ETH"
            break
        case NETWORK_NAME.BSC:
            symbol = "BNB"
            break
        case NETWORK_NAME.Polygon:
            symbol = "MATIC"
            break
        default:
    }
    return symbol
}

const wbnbOnBSC = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
const wethOnEthereum = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const wmaticOnPolygon = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
export const isWrappedEther = (blockchain: string, address: string) => {
    if (address) {
        switch (blockchain) {
            case NETWORK_NAME.BSC:
                return (address.toLowerCase() === wbnbOnBSC.toLowerCase())
            case NETWORK_NAME.Ethereum:
                return (address.toLowerCase() === wethOnEthereum.toLowerCase())
            case NETWORK_NAME.Polygon:
                return (address.toLowerCase() === wmaticOnPolygon.toLowerCase())
        }
    }else{
        return false
    }
}

export const getFixedDecimals = (p: number, precisions: number): number => {
    for (let i = 0; i >= -23; i--) {
        if (p >= Math.pow(10, i)) {
            return Math.abs(i) + precisions
        }
    }
    return 0
}

export const isContract = async (address: string, blockchain: string): Promise<boolean> => {
    try {
        const chainId = getChainIdFromName(blockchain)
        const code = await RpcProviders[chainId].getCode(address)
        if (code !== '0x') return true
    } catch (error) { }
    return false
}

export const isDeadOrZeroAddress = (tokenAddress: string) => {
    let ta = tokenAddress.toLowerCase()
    if (ta === ZERO_ADDRESS || ta === DEAD_ADDRESS) return true
    return false
}

export const getShortDateTimeWithoutSeconds = (d: Date): string => {
    return d.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    // let res: string = d.toISOString().slice(0, 16)
    // return res.split('T')[0] + '  ' + res.split('T')[1]
}

export const getShortDateTime = (d: Date): string => {
    return d.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    // let res: string = d.toISOString().slice(0, 19)
    // return res.split('T')[0] + '  ' + res.split('T')[1]
}

export const getShortDateTimeWithoutSeconds_ = (d: Date): string => {
    let y = d.getFullYear()
    let m = (d.getMonth() + 1).toString().padStart(2, '0')
    let date = d.getDate().toString().padStart(2, '0')
    let h = d.getHours().toString().padStart(2, '0')
    let min = d.getMinutes().toString().padStart(2, '0')
    return y + "-" + m + "-" + date + " " + h + ':' + min
}

export const getShortDateTimeWithoutSeconds_yy = (d: Date): string => {
    let y = d.getFullYear().toString().substring(2)
    let m = (d.getMonth() + 1).toString().padStart(2, '0')
    let date = d.getDate().toString().padStart(2, '0')
    let h = d.getHours().toString().padStart(2, '0')
    let min = d.getMinutes().toString().padStart(2, '0')
    return m + "-" + date + "-" + y + " " + h + ':' + min
}

export const getShortDateTime_ = (d: Date): string => {
    let y = d.getFullYear()
    let m = (d.getMonth() + 1).toString().padStart(2, '0')
    let date = d.getDate().toString().padStart(2, '0')
    let h = d.getHours().toString().padStart(2, '0')
    let min = d.getMinutes().toString().padStart(2, '0')
    let s = d.getSeconds().toString().padStart(2, '0')
    return y + "-" + m + "-" + date + " " + h + ':' + min + ':' + s
}

export const getShortDate_ = (d: Date): string => {
    let y = d.getFullYear()
    let m = (d.getMonth() + 1).toString().padStart(2, '0')
    let date = d.getDate().toString().padStart(2, '0')  
    return y + "-" + m + "-" + date
}

export const getShortenAmount = (amount: number, fixed: number): string => {
    let res = amount ?? 0
    let unit = ''
    if (amount >= 1000000) {
        res = amount / 1000000
        unit = 'M'
    } else if (amount >= 1000) {
        res = amount / 1000
        unit = 'K'
    }
    return floatToFixedNumber(res.toFixed(getFixedDecimals(res, fixed))) + unit
}
export const isToken = (token: string, address: string): boolean => {
    if (token.toLowerCase() === address.toLowerCase()) return true
    return false
}

export const isInAddresses = (groups: any[], address: string): boolean => {    
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].toLowerCase() === address.toLowerCase()) return true
    }
    return false
}

export const unknownToken_Icon = './images/token_logos/unknown.svg'

export const SWAP_INPUTBOX_WRAP = 400

export const wbnbToken = {
    "name": "BNB Token",
    "symbol": "BNB",
    "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "decimals": 18,
    "logoURI": "./images/token_logos/bnb.png",
    "partner": false
}

export const reqOptionsAuthorized = (userToken: string, contentType: string = 'application/json', method = 'get', data = {}) => {
    return {
        headers: new Headers({
            'Content-Type': contentType,
            'Authorization': 'Bearer ' + userToken
        }),
        method: method,
        body: method.toLowerCase() === 'get' ? null : JSON.stringify(data)
    }
}

export const openEtherscan = (data: string, type: string) => {
    const newWindow = window.open(getEtherscanLink(56, data, type), '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}

export const copyTextToClipboard = async (text: string) => {
    if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(text)
    } else {
        return document.execCommand('copy', true, text)
    }
}

export const floatToFixedNumber = (n: string) => {
    if (Math.floor(Number(n)) === Number(n)) return Number(n).toString()
    let index = n.length
    for (let i = n.length - 1; i >= 0; i--) {
        if (n.substring(i, i + 1) !== '0') {
            index = i
            break;
        }
    }
    return n.substring(0, index + 1)
}

export const decodeTxErrorMessage = (err: any) => {
    let message = ""
    if (err) {
        if (err.code) {
            if (err.code === "ACTION_REJECTED") return "ACTION_REJECTED"
        }
        let index = err?.message.indexOf("execution reverted:")
        if (index >= 0) {
            try {
                message = err.error.data.message
            } catch (error) { }
            if (message.length > 0) return message
        }
        if (err.reason){
            return err.reason.toString()
        }
        try {
            message = (err.data?.message || err?.message || err).toString()
        } catch (error) { }
    }
    return message
}


export const formatEther_Optimized = (amount: BigNumber, decimals: number = 18, toFixed: number, groupSeparator: boolean) => {
    if (amount.gte(parseUnits('1', decimals))){ // >=1 
        return formatEther(amount, decimals, toFixed, groupSeparator)
    }else{ // < 1 
        let num = Number(formatUnits(amount, decimals))
        let strFixedNum = floatToFixedNumber(num.toFixed(getFixedDecimals(num, toFixed)))
        if (groupSeparator) {
            return Number(strFixedNum).toLocaleString(undefined, { maximumFractionDigits: getFixedDecimals(num, toFixed) + 1 })
        }else{
            return strFixedNum
        }
    }   
}

export const formatFixedNumber_Optimized = (amount:number, toFixed: number, groupSeparator: boolean) => {
    let strFixedNum = floatToFixedNumber(amount.toFixed(getFixedDecimals(amount, toFixed)))
    if (groupSeparator){
        return Number(strFixedNum).toLocaleString(undefined, { maximumFractionDigits: getFixedDecimals(amount, toFixed) + 1 })
    }else{
        return strFixedNum
    }
}

export const BSC_BLOCKTIME = 3 //3s
export const ONEDAY_SECS = 86400

export const BUY_BASE_URL = 'https://pancakeswap.finance/swap?outputCurrency='