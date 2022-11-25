import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { JsonRpcSigner } from "@ethersproject/providers"
import { formatUnits, parseUnits } from "@ethersproject/units"
import pcsRouterAbi from "@app/constants/contracts/abis/pancakeRouterV2.json"
import Web3 from "web3"
import {
  BUSDTokenAddress,
  PCSRouterV2Address,
  BNBTokenAddress,
  RpcProviders,
} from "@app/constants/AppConstants"
import { useEthers } from "@usedapp/core"
import { getChainIdFromName, getContract } from "@app/utils/utils"

interface GetPriceOptions {
  tokenAddress: string
  decimals: number
}

interface GetPriceResult {
  updatedAt: Date,
  price: string
}

const blockchain = process.env.blockchain

export function useTokenPrice(): {
  getTokenPrice: ({ tokenAddress,
    decimals
  }: GetPriceOptions) => Promise<GetPriceResult>
} {
  const { account } = useEthers()
  const getTokenPrice = async ({ tokenAddress,
    decimals
  }: GetPriceOptions) => {
    try {
      const chainId = getChainIdFromName(blockchain)
      const pancakeSwapContract: Contract = getContract(PCSRouterV2Address, pcsRouterAbi, RpcProviders[chainId], account ? account : undefined)
      if (tokenAddress === BNBTokenAddress) {
        const amountOut = await pancakeSwapContract.getAmountsOut(parseUnits("1", decimals ?? 18), [
          BNBTokenAddress,
          BUSDTokenAddress,
        ])

        return {
          updatedAt: new Date(),
          price: formatUnits(amountOut[1]),
        }
      }

      const amountOut = await pancakeSwapContract.getAmountsOut(parseUnits("1", decimals ?? 18), [
        tokenAddress,
        BNBTokenAddress,
      ])
      
      const usdtAmountOut = await pancakeSwapContract.getAmountsOut(
        BigNumber.from(amountOut[1]).mul(10000).div(9975),
        [BNBTokenAddress, BUSDTokenAddress]
      )
            
      return {
        updatedAt: new Date(),
        price: formatUnits(BigNumber.from(usdtAmountOut[1]).mul(10000).div(9975)),
      }
    } catch (error) {
      console.log(error)
      return {
        updatedAt: new Date(),
        price: "0"
      }
    }
  }
  return { getTokenPrice }
}

