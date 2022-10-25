import { BigNumberish } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { JsonRpcSigner } from "@ethersproject/providers"
import { formatUnits, parseUnits } from "@ethersproject/units"
import PCS_ROUTER_ABI from 'src/constants/contracts/abis/pancakeRouterV2.json'
import Web3 from "web3";
import {
  BUSDTokenAddress,
  BNBTokenAddress,
} from "@app/constants/AppConstants"
import { PancakeRouterContractAddress } from "@app/constants/SwapConstants"

interface GetPriceOptions {
  amount: BigNumberish;
  tokenAddress: string;
  decimals: number | string;
}

interface GetPriceResult {
  token: string;
  bnb: string;
  usdt: string;
}

export async function getTokenPrice({
  amount,
  decimals,
  tokenAddress,
}: GetPriceOptions): Promise<GetPriceResult> {
  try {
    const pancakeSwapContract = new Contract(
      PancakeRouterContractAddress,
      PCS_ROUTER_ABI
    );

    if (tokenAddress === BNBTokenAddress) {
      const amountOut = await pancakeSwapContract.getAmountsOut(amount, [
        BNBTokenAddress,
        BUSDTokenAddress,
      ]);
      console.log("BNB", {
        token: formatUnits(amount),
        bnb: formatUnits(amount),
        usdt: formatUnits(amountOut[1]),
      });
      return {
        token: formatUnits(amount, decimals),
        bnb: formatUnits(amount, decimals),
        usdt: formatUnits(amountOut[1]),
      };
    }
    const amountOut = await pancakeSwapContract.getAmountsOut(amount, [
      tokenAddress,
      BNBTokenAddress,
    ]);

    const usdtAmountOut = await pancakeSwapContract.getAmountsOut(
      amountOut[1],
      [BNBTokenAddress, BUSDTokenAddress]
    );

    return {
      token: formatUnits(amount, decimals),
      bnb: formatUnits(amountOut[1]),
      usdt: formatUnits(usdtAmountOut[1]),
    };
  } catch (error) {
    console.log(error);
    return {
      token: "0",
      bnb: "0",
      usdt: "0",
    };
  }
}

export async function getBNBPrice() {
  try {
    const binanceProvider = new Web3.providers.HttpProvider(
      process.env.NEXT_PUBLIC_BINANCE_NODE
    );
    const BinanceWeb3Service = new Web3(binanceProvider);

    const pancakeSwap = new BinanceWeb3Service.eth.Contract(
      PCS_ROUTER_ABI as any,
      PancakeRouterContractAddress
    );
    const [_, bnbPriceInBusd] = await pancakeSwap.methods
      .getAmountsOut(parseUnits("1", 18), [BNBTokenAddress, BUSDTokenAddress])
      .call();
    return Number(formatUnits(bnbPriceInBusd, 18));
  } catch (err) { }
  return 0;
}
