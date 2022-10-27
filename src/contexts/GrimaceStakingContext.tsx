/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from "@usedapp/core";
import { getContract, calculateGasMargin, isWrappedEther } from '@app/utils/utils'
import { TransactionResponse } from '@ethersproject/providers'
import { RpcProviders, GrimaceClubAddress, AppTokenAddress, ZERO_ADDRESS } from "src/constants/AppConstants"
import useRefresh from 'src/hooks/useRefresh'
import { getChainIdFromName } from '@app/utils/utils'
import grimaceFactoryAbi from '@app/constants/contracts/abis/grimaceStakingClub.json'
import poolAbi from '@app/constants/contracts/abis/grimaceStakingPool.json'
import ERC20_ABI from '@app/constants/contracts/abis/erc20.json'
import { useNativeTokenBalance, useTokenBalanceCallback } from 'src/hooks/hooks'
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';

declare type Maybe<T> = T | null | undefined

export interface ITokenInfo {
    address: string
    name: string
    symbol: string
    decimals: number
    logoURI: string
}
export interface IPoolAndUserInfo {
    userStaked: BigNumber
    userStakedUSD: number
    userUnlockTime: number
    userTotalEarned: BigNumber
    userTotalEarnedUSD: number
    availableReward: BigNumber
    availableRewardUSD: number
    isApprovedForMax: boolean

    stakingTokenPrice: number
    rewardTokenPrice: number
    stakingToken: ITokenInfo
    rewardToken: ITokenInfo
    lastRewardBlock: number
    accRewardPerShare: BigNumber
    rewardPerBlock: BigNumber
    poolOwner: string
    lockDuration: number
    startTime: number
    endTime: number

    totalStaked: BigNumber
    totalStakedUSD: number
    totalClaimed: BigNumber
    totalClaimedUSD: number
    rewardRemaining: BigNumber
    rewardRemainingUSD: number
}

export interface IClubMapPoolInfo {
    poolAddress: string
    poolAndUserInfo: IPoolAndUserInfo
    owner: string
    createdAt: number
}

export interface IGrimaceStakingContext {
    grimaceBalance: BigNumber
    bnbBalance: BigNumber
    allLivePools: IClubMapPoolInfo[]
    allExpiredPools: IClubMapPoolInfo[]
    allDisabledPools: IClubMapPoolInfo[]
    pagedLivePools: IClubMapPoolInfo[]
    pagedExpiredPools: IClubMapPoolInfo[]
    grimaceClubOwner: string
    blockTimestamp: number
    isLiveSelected: boolean

    setRowsPerPage: (val: number) => void
    setPage: (val: number) => void
    setIsLiveSelected: (val: boolean) => void
    stakeCallback: (amount: BigNumber, poolAddress: string, stakingTokenAddress: string) => Promise<any>
    unstakeCallback: (amount: BigNumber, poolAddress: string) => Promise<any>
    emergencyUnstakeCallback: (poolAddress: string) => Promise<any>
    claimCallback: (poolAddress: string) => Promise<any>
    stopStakingCallback: (poolAddress: string) => Promise<any>
    resumeStakingCallback: (poolAddress: string) => Promise<any>
    updateLockDurationCallback: (lockDuration: BigNumber, poolAddress: string) => Promise<any>
    updateRewardPerBlockCallback: (rewardPerBlock: BigNumber, poolAddress: string) => Promise<any>
    emergencyRewardWithdrawCallback: (amount: BigNumber, poolAddress: string) => Promise<any>
    emergencyAllRewardWithdrawCallback: (poolAddress: string) => Promise<any>
    updateEndTimeCallback: (endTime: BigNumber, poolAddress: string) => Promise<any>
    setPoolUsableCallback: (isUsable: boolean, poolAddress: string) => Promise<any>
    updatePayTokenCallback: (payTokenAddress: string) => Promise<any>
    updatePayAmountCallback: (amount: BigNumber) => Promise<any>
    ownerWithdrawPayTokensCallback: (poolAddress: string) => Promise<any>
    updateClubMapPoolInfo()
    updatePagedLivePools()
    updatePagedExpiredPools()
}

const GrimaceStakingContext = React.createContext<Maybe<IGrimaceStakingContext>>(null)
const blockchain = 'bsc'

export const GrimaceStakingClubProvider = ({ children = null as any }) => {
    const { account, library } = useEthers()
    const [grimaceBalance, setGrimaceBalance] = useState(BigNumber.from(0))
    const { slowRefresh, fastRefresh } = useRefresh()
    const [bnbBalance, setBnbBalance] = useState(BigNumber.from(0))
    const nativeBalance = useNativeTokenBalance('bsc')
    const { nativeBalanceCallback } = useTokenBalanceCallback()

    const [allLivePools, setAllLivePools] = useState<IClubMapPoolInfo[]>([])
    const [allExpiredPools, setAllExpiredPools] = useState<IClubMapPoolInfo[]>([])
    const [allDisabledPools, setAllDisabledPools] = useState<IClubMapPoolInfo[]>([])

    const [pagedLivePools, setPagedLivePools] = useState<IClubMapPoolInfo[]>([])
    const [pagedExpiredPools, setPagedExpiredPools] = useState<IClubMapPoolInfo[]>([])

    const [grimaceClubOwner, setGrimaceClubOwner] = useState('')

    const [blockTimestamp, setBlockTimestamp] = useState(0)

    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [page, setPage] = useState(1)

    const [isLiveSelected, setIsLiveSelected] = useState(true)

    useEffect(() => {
        if (nativeBalance) {
            setBnbBalance(nativeBalance)
        }
    }, [nativeBalance])

    useEffect(() => {
        try {
            updateClubMapPoolInfo()
        } catch (e) { }
    }, [slowRefresh, account])

    useEffect(() => {
        if (isLiveSelected) {
            updatePagedLivePools()
        }
    }, [account, rowsPerPage, page, isLiveSelected, allLivePools])

    useEffect(() => {
        if (!isLiveSelected) {
            updatePagedExpiredPools()
        }
    }, [account, rowsPerPage, page, isLiveSelected, allExpiredPools])

    useEffect(() => {
        const fetch = async () => {
            const chainId = getChainIdFromName(blockchain)
            let blocknumber = await RpcProviders[chainId].getBlockNumber()
            let blockData = await RpcProviders[chainId].getBlock(blocknumber)
            setBlockTimestamp(blockData.timestamp)
        }
        fetch()
    }, [fastRefresh])

    const stakeCallback = async function (amount: BigNumber, poolAddress: string, stakingTokenAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        if (isWrappedEther('bsc', stakingTokenAddress)) {
            return poolContract.estimateGas.stake(amount, { value: amount }).then(estimatedGasLimit => {
                const gas = estimatedGasLimit
                return poolContract.stake(amount, {
                    value: amount,
                    gasLimit: calculateGasMargin(gas)
                }).then((response: TransactionResponse) => {
                    return response.wait().then((res: any) => {
                        return { status: res.status, hash: response.hash }
                    })
                })
            })
        } else {
            return poolContract.estimateGas.stake(amount).then(estimatedGasLimit => {
                const gas = estimatedGasLimit
                return poolContract.stake(amount, {
                    gasLimit: calculateGasMargin(gas)
                }).then((response: TransactionResponse) => {
                    return response.wait().then((res: any) => {
                        return { status: res.status, hash: response.hash }
                    })
                })
            })
        }
    }

    const unstakeCallback = async function (amount: BigNumber, poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.unstake(amount).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.unstake(amount, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const emergencyUnstakeCallback = async function (poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.emergencyUnstake().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.emergencyUnstake({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const claimCallback = async function (poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.claim().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.claim({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    //pool owner's functions
    const stopStakingCallback = async function (poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.stopStaking().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.stopStaking({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const resumeStakingCallback = async function (poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.resumeStaking().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.resumeStaking({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const updateLockDurationCallback = async function (lockDuration: BigNumber, poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.updateLockDuration(lockDuration).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.updateLockDuration(lockDuration, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const updateRewardPerBlockCallback = async function (rewardPerBlock: BigNumber, poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.updateRewardPerBlock(rewardPerBlock).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.updateRewardPerBlock(rewardPerBlock, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const emergencyRewardWithdrawCallback = async function (amount: BigNumber, poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.emergencyRewardWithdraw(amount).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.emergencyRewardWithdraw(amount, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const emergencyAllRewardWithdrawCallback = async function (poolAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        return poolContract.estimateGas.emergencyAllRewardWithdraw().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.emergencyAllRewardWithdraw({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }
    //////////////

    //factory owner's functions
    const updateEndTimeCallback = async function (endTime: BigNumber, poolAddress: string) {
        if (!account || !library || !GrimaceClubAddress || !poolAddress) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.updateEndTime(poolAddress, endTime).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.updateEndTime(poolAddress, endTime, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const setPoolUsableCallback = async function (isUsable: boolean, poolAddress: string) {
        if (!account || !library || !GrimaceClubAddress || !poolAddress) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.setPoolUsable(poolAddress, isUsable).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.setPoolUsable(poolAddress, isUsable, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const updatePayTokenCallback = async function (payTokenAddress: string) {
        if (!account || !library || !GrimaceClubAddress || !payTokenAddress) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.updatePayToken(payTokenAddress).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.updatePayToken(payTokenAddress, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const updatePayAmountCallback = async function (amount: BigNumber) {
        if (!account || !library || !GrimaceClubAddress) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.updatePayAmount(amount).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.updatePayAmount(amount, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const ownerWithdrawPayTokensCallback = async function (poolAddress: string) {
        if (!account || !library || !GrimaceClubAddress) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.ownerWithdrawPayTokens().then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.ownerWithdrawPayTokens({
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }
    ///////////////////

    const fetchTokenInfo = async (tokenAddress: string) => {
        if (isWrappedEther('bsc', tokenAddress)) {
            return { address: tokenAddress, name: "BNB Token", symbol: "BNB", decimals: 18 }
        } else {
            const chainId = getChainIdFromName(blockchain);
            const tokenContract: Contract = getContract(tokenAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
            const name = await tokenContract.name()
            const decimals = await tokenContract.decimals()
            const symbol = await tokenContract.symbol()
            return { address: tokenAddress, name: name, symbol: symbol, decimals: Number(decimals) }
        }
    }

    const fetchAvailableRewards = async (poolContract: Contract) => {
        const res = await poolContract.pendingReward(account)
        return res
    }

    const fetchRewardRemaining = async (poolContract: Contract) => {
        const res = await poolContract.rewardRemaining()
        return res
    }

    const fetchTotalStaked = async (poolContract: Contract) => {
        const res = await poolContract.totalStaked()
        return res
    }

    const fetchTotalClaimed = async (poolContract: Contract) => {
        const res = await poolContract.totalClaimed()
        return res
    }

    const fetchIsEndedStaking = async (poolContract: Contract) => {
        const res = await poolContract.isEndedStaking()
        return res
    }

    const fetchPoolInfo = async (poolContract: Contract) => {
        const res = await poolContract.poolInfo()
        return res
    }

    const fetchUserInfo = async (poolContract: Contract) => {
        const res = await poolContract.userInfo(account)
        return res
    }

    const fetchPendingReward = async (poolContract: Contract) => {
        const res = await poolContract.pendingReward(account)
        return res
    }

    const fetchAllowance = async (tokenAddress: string, recvAddress: string) => {
        const chainId = getChainIdFromName(blockchain);
        const tokenContract: Contract = getContract(tokenAddress, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
        const res = await tokenContract.allowance(account, recvAddress)
        return res
    }

    const fetchClubMapPoolInfo = async (factoryContract: Contract) => {
        const res = await factoryContract.getAllPoolInfos(account)
        return res
    }

    const updateClubMapPoolInfo = async () => {
        const chainId = getChainIdFromName(blockchain);
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, RpcProviders[chainId], account ? account : undefined)
        const owner = await factoryContract.owner()
        setGrimaceClubOwner(owner)

        fetchClubMapPoolInfo(factoryContract).then(async result => {
            if (result.length > 0) {
                let temp: IClubMapPoolInfo[] = []
                let livePools = result[0]
                let expiredPools = result[1]
                let disabledPools = result[2]

                await Promise.all(livePools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                }))
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllLivePools(temp)
                temp = []

                await Promise.all(expiredPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                }))
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllExpiredPools(temp)
                temp = []

                await Promise.all(disabledPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                }))
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllDisabledPools(temp)
            } else {
                setAllLivePools([])
                setAllExpiredPools([])
                setAllDisabledPools([])
            }
        }).catch(error => {
            console.log(error)
        })
    }

    const getValueUSDFromAmount = (amount: BigNumber, price: number, decimals: number) => {
        return Number(formatUnits(amount.mul(parseEther(price.toFixed(18))).div(parseEther('1')), decimals))
    }

    const fetchPoolAndUserInfo = async (item: IClubMapPoolInfo, poolContract: Contract) => {
        let t: IPoolAndUserInfo

        fetchPoolInfo(poolContract).then(async result => {
            await fetchTokenInfo(result.stakingToken).then(async token => {
                t.stakingToken = { address: token.address, name: token.name, symbol: token.symbol, decimals: token.decimals, logoURI: result.stakeTokenLogo }
            }).catch(error => {
                console.log(error)
            })
            await fetchTokenInfo(result.rewardToken).then(async token => {
                t.rewardToken = { address: token.address, name: token.name, symbol: token.symbol, decimals: token.decimals, logoURI: result.rewardTokenLogo }
            }).catch(error => {
                console.log(error)
            })
            t.rewardToken = result.rewardToken
            await fetch(`/api/tokenPriceFromPCS?baseCurrency=${result.stakingToken}`)
                .then((res) => res.json())
                .then((res) => {
                    t.stakingTokenPrice = Number(res.data.price)
                }).catch(error => { })

            await fetch(`/api/tokenPriceFromPCS?baseCurrency=${result.rewardToken}`)
                .then((res) => res.json())
                .then((res) => {
                    t.rewardTokenPrice = Number(res.data.price)
                }).catch(error => { })
            t.lastRewardBlock = Number(result.lastRewardBlock)
            t.accRewardPerShare = result.accRewardPerShare
            t.rewardPerBlock = result.rewardPerBlock
            t.poolOwner = result.poolOwner
            t.lockDuration = Number(result.lockDuration)
            t.startTime = Number(result.startTime)
            t.endTime = Number(result.endTime)
        }).catch(error => {
            console.log(error)
        })
        if (account) {
            await fetchUserInfo(poolContract).then(async result => {
                t.userStaked = result.amount
                t.userStakedUSD = getValueUSDFromAmount(result.amount, t.stakingTokenPrice, t.stakingToken.decimals)
                t.userUnlockTime = Number(result.unlockTime)
                t.userTotalEarned = result.totalEarned
                t.userTotalEarnedUSD = getValueUSDFromAmount(result.totalEarned, t.rewardTokenPrice, t.rewardToken.decimals)
            }).catch(error => {
                console.log(error)
            })
            await fetchPendingReward(poolContract).then(async result => {
                t.availableReward = result
                t.availableRewardUSD = getValueUSDFromAmount(result, t.rewardTokenPrice, t.rewardToken.decimals)
            }).catch(error => {
                console.log(error)
            })
            await fetchAllowance(t.stakingToken.address, item.poolAddress).then(async allowance => {
                if (allowance.gt(parseUnits("1", t.stakingToken.decimals))) t.isApprovedForMax = true
                else t.isApprovedForMax = false
            }).catch(error => {
                console.log(error)
            })
        } else {
            t.userStaked = BigNumber.from(0)
            t.userStakedUSD = 0
            t.userUnlockTime = 0
            t.userTotalEarned = BigNumber.from(0)
            t.userTotalEarnedUSD = 0
            t.availableReward = BigNumber.from(0)
            t.availableRewardUSD = 0
            t.isApprovedForMax = false
        }
        await fetchTotalStaked(poolContract).then(async amount => {
            t.totalStaked = amount
            t.totalStakedUSD = getValueUSDFromAmount(amount, t.stakingTokenPrice, t.stakingToken.decimals)
        }).catch(error => {
            console.log(error)
        })
        await fetchTotalClaimed(poolContract).then(async amount => {
            t.totalClaimed = amount
            t.totalClaimedUSD = getValueUSDFromAmount(amount, t.rewardTokenPrice, t.rewardToken.decimals)
        }).catch(error => {
            console.log(error)
        })
        await fetchRewardRemaining(poolContract).then(async amount => {
            t.rewardRemaining = amount
            t.rewardRemainingUSD = getValueUSDFromAmount(amount, t.rewardTokenPrice, t.rewardToken.decimals)
        }).catch(error => {
            console.log(error)
        })
        return t
    }

    const updatePagedLivePools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            await Promise.all(
                allLivePools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allLivePools.length) : allLivePools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            setPagedLivePools(temp)
        } catch (error) {
            console.log(error)
        }
    }

    const updatePagedExpiredPools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            await Promise.all(
                allExpiredPools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allExpiredPools.length) : allExpiredPools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            setPagedExpiredPools(temp)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <GrimaceStakingContext.Provider
            value={{
                grimaceBalance,
                bnbBalance,
                allLivePools,
                allExpiredPools,
                allDisabledPools,
                pagedLivePools,
                pagedExpiredPools,
                grimaceClubOwner,
                blockTimestamp,
                isLiveSelected,

                setRowsPerPage,
                setPage,
                setIsLiveSelected,
                stakeCallback,
                unstakeCallback,
                emergencyUnstakeCallback,
                claimCallback,
                stopStakingCallback,
                resumeStakingCallback,
                updateLockDurationCallback,
                updateRewardPerBlockCallback,
                emergencyRewardWithdrawCallback,
                emergencyAllRewardWithdrawCallback,
                updateEndTimeCallback,
                setPoolUsableCallback,
                updatePayTokenCallback,
                updatePayAmountCallback,
                ownerWithdrawPayTokensCallback,
                updateClubMapPoolInfo,
                updatePagedLivePools,
                updatePagedExpiredPools,
            }}
        >
            {children}
        </GrimaceStakingContext.Provider >
    )
}

export const useGrimaceStakingClub = () => {
    const context = useContext(GrimaceStakingContext)

    if (!context) {
        throw new Error('Component rendered outside the provider tree')
    }

    return context
}
