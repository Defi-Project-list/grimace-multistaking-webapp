import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEffect, useState } from "react"
import { useEthers } from "@usedapp/core"
import ERC20_ABI from 'src/constants/contracts/abis/erc20.json'
import { RpcProviders } from "@app/constants/AppConstants"
import { getChainIdFromName } from '@app/utils/utils'
import useRefresh from './useRefresh'
import { TransactionResponse } from '@ethersproject/providers'
import { getContract, parseEther, getProviderOrSigner } from '@app/utils/utils'
import { MaxUint256 } from '@ethersproject/constants'

export function useNativeTokenBalance(blockchain: string): BigNumber {
  const { account } = useEthers()
  const chainId = getChainIdFromName(blockchain)
  const [balance, setBalance] = useState(BigNumber.from(0))
  const { slowRefresh, fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchNativeToken = async () => {
      const balance = await RpcProviders[chainId].getBalance(account)
      return balance
    }
    if (account) {
      fetchNativeToken().then(result => {
        setBalance(result)
      }).catch(error => { })
    } else {
      setBalance(BigNumber.from(0))
    }
  }, [account, slowRefresh])
  return balance
}

export function useToken(tokenContractAddress: string, blockchain: string): { name: string, symbol: string, decimals: number } {
  const { account, library } = useEthers()
  const [token, setToken] = useState<any>()
  const chainId = getChainIdFromName(blockchain)

  useEffect(() => {
    const fetchToken = async () => {
      const tokenContract: Contract = getContract(tokenContractAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
      const name = await tokenContract.name()
      const decimals = await tokenContract.decimals()
      const symbol = await tokenContract.symbol()
      return { name: name, symbol: symbol, decimals: decimals }
    }
    if (tokenContractAddress) {
      fetchToken().then(result => {
        setToken(result)
      }).catch(error => { })
    }
  }, [tokenContractAddress])

  return token
}

export function useTokenAllowance(): { tokenAllowanceCallback: (owner: string, spender: string, tokenContractAddress: string, blockchain: string) => Promise<BigNumber> } {
  const { account, library } = useEthers()
  const tokenAllowanceCallback = async function (owner: string, spender: string, tokenContractAddress: string, blockchain: string) {
    const chainId = getChainIdFromName(blockchain)
    const tokenContract: Contract = getContract(tokenContractAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
    return tokenContract.allowance(owner, spender).then((res: BigNumber) => {
      return res
    })
  }
  return { tokenAllowanceCallback }
}

export function useTokenBalance(tokenAddress: string, blockchain: string): BigNumber {
  const { account } = useEthers()
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
  const chainId = getChainIdFromName(blockchain)
  const { slowRefresh, fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchUserBalance = async () => {
      const tokenContract: Contract = getContract(tokenAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
      const amount = await tokenContract.balanceOf(account)
      return amount
    }
    if (!!account && !!tokenAddress) {
      fetchUserBalance().then(result => {
        setBalance(result)
      }).catch(error => { })
    } else {
      setBalance(BigNumber.from(0))
    }
  }, [account, tokenAddress, slowRefresh])

  return balance
}

export function useTokenBalanceCallback(): {
  tokenBalanceCallback: (tokenAddress: string, blockchain: string) => Promise<BigNumber>,
  nativeBalanceCallback: (blockchain: string) => Promise<BigNumber>
  nativeBalanceFromAddrCallback: (blockchain: string, address: string) => Promise<BigNumber>
} {
  const { account, library } = useEthers()

  const tokenBalanceCallback = async function (tokenAddress: string, blockchain: string) {
    const chainId = getChainIdFromName(blockchain)
    const tokenContract: Contract = getContract(tokenAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
    return tokenContract.balanceOf(account).then((res: BigNumber) => {
      return res
    })
  }

  const nativeBalanceCallback = async function (blockchain: string) {
    const chainId = getChainIdFromName(blockchain)
    return RpcProviders[chainId].getBalance(account).then((res: BigNumber) => {
      return res
    })
  }

  const nativeBalanceFromAddrCallback = async function (blockchain: string, address: string) {
    const chainId = getChainIdFromName(blockchain)
    return RpcProviders[chainId].getBalance(address).then((res: BigNumber) => {
      return res
    })
  }

  return { tokenBalanceCallback, nativeBalanceCallback, nativeBalanceFromAddrCallback }
}

export function useTokenCallback(): {
  tokenCallback: (tokenContractAddress: string, blockchain: string) => Promise<any>
} {
  const { account, library } = useEthers()
  const tokenCallback = async function (tokenContractAddress: string, blockchain: string) {
    try {
      const chainId = getChainIdFromName(blockchain)
      const tokenContract: Contract = getContract(tokenContractAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
      const name = await tokenContract.name()
      const decimals = await tokenContract.decimals()
      const symbol = await tokenContract.symbol()
      const address = tokenContract.address
      return { address:address, name: name, symbol: symbol, decimals: decimals }
    } catch (err) {
      return
    }
  }

  return { tokenCallback }
}

export function useApproveCallback(): {
  approveCallback: (recvAddress: string, tokenContractAddress: string, blockchain: string) => Promise<string>
} {
  const { account, library } = useEthers()
  const approveCallback = async function (recvAddress: string, tokenContractAddress: string, blockchain: string) {
    const chainId = getChainIdFromName(blockchain)
    const tokenContract: Contract = getContract(tokenContractAddress, ERC20_ABI, library, account ? account : undefined)
    if (!account || !library) return
    const provider = getProviderOrSigner(library, account) as any
    // const totalSupply = await tokenContract.totalSupply()
    return tokenContract.connect(provider).approve(recvAddress, MaxUint256).then(async (response: TransactionResponse) => {
      return response.wait().then((_: any) => {
        return response.hash
      })
    })
  }
  return { approveCallback }
}
