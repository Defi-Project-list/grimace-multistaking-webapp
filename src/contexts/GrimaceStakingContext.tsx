/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from "@usedapp/core";
import { getContract, calculateGasMargin, isWrappedEther, isAddress, ONEDAY_SECS, BSC_BLOCKTIME } from '@app/utils/utils'
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
    userAvailableReward: BigNumber
    userAvailableRewardUSD: number
    isApprovedForMax: boolean
    userStakeTokenBalance: BigNumber
    userRewardTokenBalance: BigNumber
    userStakeTokenBalanceUSD: number
    userRewardTokenBalanceUSD: number

    stakingTokenPrice: number
    rewardTokenPrice: number
    stakingToken: ITokenInfo
    rewardToken: ITokenInfo
    websiteURL: string
    telegramContact: string
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

    apr: number
}

export interface IClubMapPoolInfo {
    poolAddress: string
    poolAndUserInfo: IPoolAndUserInfo
    owner: string
    createdAt: number
}

export interface IGrimaceStakingContext {
    bnbBalance: BigNumber
    allLivePools: IClubMapPoolInfo[]
    allExpiredPools: IClubMapPoolInfo[]
    allDisabledPools: IClubMapPoolInfo[]
    pagedLivePools: IClubMapPoolInfo[]
    pagedExpiredPools: IClubMapPoolInfo[]
    grimaceClubOwner: string
    blockTimestamp: number
    isLiveSelected: boolean
    rowsPerPage: number
    page: number
    pageCount: number
    isLoadingPools: boolean
    totalStakedValue: number

    setRowsPerPage: (val: number) => void
    setPage: (val: number) => void
    setPageCount: (val: number) => void
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
    updatePoolOwnerCallback: (newOwner: string, poolAddress: string) => Promise<any>
    updateNoNeedChargeTokenCallback: (token: string) => Promise<any>
    ownerWithdrawPayTokensCallback: (poolAddress: string) => Promise<any>
    updateClubMapPoolInfo: () => void
    updatePagedLivePools: () => void
    updatePagedExpiredPools: () => void
    updateChangedPoolAndUserInfo: (poolIndex: number) => void
    setUserInfo_Approved: (poolIndex: number) => void
}

const GrimaceStakingContext = React.createContext<Maybe<IGrimaceStakingContext>>(null)
const blockchain = process.env.blockchain

export const GrimaceStakingClubProvider = ({ children = null as any }) => {
    const { chainId, account, library } = useEthers()
    const { slowRefresh, normalRefresh, fastRefresh } = useRefresh()
    const [bnbBalance, setBnbBalance] = useState(BigNumber.from(0))
    const nativeBalance = useNativeTokenBalance(blockchain)
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
    const [pageCount, setPageCount] = useState(0)

    const [isLiveSelected, setIsLiveSelected] = useState(true)

    const [isLoadingPools, setIsLoadingPools] = useState(false)

    const [totalStakedValue, setTotalStakedValue] = useState(0)

    useEffect(() => {
        if (isLiveSelected) {
            if (allLivePools) setPageCount(rowsPerPage > 0 ? Math.ceil(allLivePools.length / rowsPerPage) : 0)
            else setPageCount(0)
            setPage(1)
        } else {
            if (allExpiredPools) setPageCount(rowsPerPage > 0 ? Math.ceil(allExpiredPools.length / rowsPerPage) : 0)
            else setPageCount(0)
            setPage(1)
        }
    }, [rowsPerPage, isLiveSelected, allLivePools, allExpiredPools])

    useEffect(() => {
        if (nativeBalance) {
            setBnbBalance(nativeBalance)
        }
    }, [nativeBalance])

    useEffect(() => {
        try {
            updateClubMapPoolInfo()
        } catch (e) { }
    }, [account])

    useEffect(() => {
        updateTotalStakedValue()
    }, [slowRefresh, allLivePools, allExpiredPools])

    useEffect(() => {
        if (isLiveSelected) {
            updatePagedLivePools()
        }
    }, [account, page, isLiveSelected, allLivePools, fastRefresh])

    useEffect(() => {
        setPagedExpiredPools([])
    }, [account, page, isLiveSelected, allExpiredPools])

    useEffect(() => {
        setPagedLivePools([])
    }, [account, page, isLiveSelected, allLivePools])

    useEffect(() => {
        if (!isLiveSelected) {
            updatePagedExpiredPools()
        }
    }, [account, page, isLiveSelected, allExpiredPools, fastRefresh])

    useEffect(() => {
        const fetch = async () => {
            try {
                const chainId = getChainIdFromName(blockchain)
                let blocknumber = await RpcProviders[chainId].getBlockNumber()
                let blockData = await RpcProviders[chainId].getBlock(blocknumber)
                setBlockTimestamp(Number(blockData.timestamp))
            } catch (err) { }
        }
        fetch()
    }, [fastRefresh])

    const stakeCallback = async function (amount: BigNumber, poolAddress: string, stakingTokenAddress: string) {
        if (!account || !library || !poolAddress) return
        const poolContract: Contract = getContract(poolAddress, poolAbi, library, account ? account : undefined)
        let bnbAmount: BigNumber = BigNumber.from(0)
        if (isWrappedEther(blockchain, stakingTokenAddress)) {
            bnbAmount = bnbAmount.add(amount)
        }
        return poolContract.estimateGas.stake(amount, { value: bnbAmount }).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return poolContract.stake(amount, {
                value: bnbAmount,
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
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
        if (!account || !library || !GrimaceClubAddress || !payTokenAddress || !isAddress(payTokenAddress)) return
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

    const updatePoolOwnerCallback = async function (newOwner: string, poolAddress: string) {
        if (!account || !library || !GrimaceClubAddress || !isAddress(newOwner)) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.updatePoolOwner(newOwner, poolAddress).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.updatePoolOwner(newOwner, poolAddress, {
                gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, hash: response.hash }
                })
            })
        })
    }

    const updateNoNeedChargeTokenCallback = async function (token: string) {
        if (!account || !library || !GrimaceClubAddress || !isAddress(token)) return
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        return factoryContract.estimateGas.updateNoNeedChargeToken(token).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.updateNoNeedChargeToken(token, {
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
        if (isWrappedEther(blockchain, tokenAddress)) {
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
        if (isWrappedEther(blockchain, tokenAddress)) {
            return await tokenContract.totalSupply()
        }
        const res = await tokenContract.allowance(account, recvAddress)
        return res
    }

    const fetchClubMapPoolInfo = async (factoryContract: Contract) => {
        const res = await factoryContract.getAllPoolInfos()
        return res
    }

    const updateClubMapPoolInfo = async () => {
        const chainId = getChainIdFromName(blockchain);
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, RpcProviders[chainId], account ? account : undefined)
        const owner = await factoryContract.owner()
        setGrimaceClubOwner(owner)

        fetchClubMapPoolInfo(factoryContract).then(async result => {
            if (account) {
                try {
                    let bal = await nativeBalanceCallback(blockchain)
                    setBnbBalance(bal)
                } catch (e) { }
            } else {
                setBnbBalance(BigNumber.from(0))
            }
            if (result.length > 0) {
                let temp: IClubMapPoolInfo[] = []
                let livePools = result[0]
                let expiredPools = result[1]
                let disabledPools = result[2]
                livePools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                })
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllLivePools(temp)
                temp = []

                expiredPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                })
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllExpiredPools(temp)
                temp = []

                disabledPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, createdAt: Number(item.createdAt) })
                })
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
        let t: IPoolAndUserInfo = {
            userStaked: BigNumber.from(0), userStakedUSD: 0, userUnlockTime: 0, userTotalEarned: BigNumber.from(0),
            userTotalEarnedUSD: 0, userAvailableReward: BigNumber.from(0), userAvailableRewardUSD: 0, isApprovedForMax: false, userStakeTokenBalance: BigNumber.from(0),
            userStakeTokenBalanceUSD: 0, userRewardTokenBalance: BigNumber.from(0), userRewardTokenBalanceUSD: 0, stakingTokenPrice: 0, rewardTokenPrice: 0,
            stakingToken: undefined, rewardToken: undefined, websiteURL: '', telegramContact: '', lastRewardBlock: 0, accRewardPerShare: BigNumber.from(0),
            rewardPerBlock: BigNumber.from(0), poolOwner: '', lockDuration: 0, startTime: 0, endTime: 0, totalStaked: BigNumber.from(0), totalStakedUSD: 0,
            totalClaimed: BigNumber.from(0), totalClaimedUSD: 0, rewardRemaining: BigNumber.from(0), rewardRemainingUSD: 0, apr: 0
        }

        await fetchPoolInfo(poolContract).then(async result => {
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
            t.websiteURL = result.websiteURL
            t.telegramContact = result.telegramContact
            await fetch(`/api/tokenPriceFromPCS?baseCurrency=${result.stakingToken}`)
                .then((res) => res.json())
                .then((res) => {
                    t.stakingTokenPrice = Number(res.price)
                }).catch(error => { })

            await fetch(`/api/tokenPriceFromPCS?baseCurrency=${result.rewardToken}`)
                .then((res) => res.json())
                .then((res) => {
                    t.rewardTokenPrice = Number(res.price)
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
            const chainId = getChainIdFromName(blockchain);
            const stakeTokenContract: Contract = getContract(t.stakingToken.address, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
            const rewardTokenContract: Contract = getContract(t.rewardToken.address, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
            try {
                let bal = await stakeTokenContract.balanceOf(account)
                t.userStakeTokenBalance = bal
                t.userStakeTokenBalanceUSD = getValueUSDFromAmount(bal, t.stakingTokenPrice, t.stakingToken.decimals)
                bal = await rewardTokenContract.balanceOf(account)
                t.userRewardTokenBalance = bal
                t.userRewardTokenBalanceUSD = getValueUSDFromAmount(bal, t.rewardTokenPrice, t.rewardToken.decimals)
            } catch (e) { }

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
                t.userAvailableReward = result
                t.userAvailableRewardUSD = getValueUSDFromAmount(result, t.rewardTokenPrice, t.rewardToken.decimals)
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
            t.userAvailableReward = BigNumber.from(0)
            t.userAvailableRewardUSD = 0
            t.isApprovedForMax = false
            t.userStakeTokenBalance = BigNumber.from(0)
            t.userRewardTokenBalance = BigNumber.from(0)
        }
        await fetchTotalStaked(poolContract).then(async amount => {
            t.totalStaked = amount
            t.totalStakedUSD = getValueUSDFromAmount(amount, t.stakingTokenPrice, t.stakingToken.decimals)
            const oneYearBlocks = 365 * ONEDAY_SECS / BSC_BLOCKTIME
            const rewardAmountPerYear = t.rewardPerBlock.mul(BigNumber.from(oneYearBlocks))
            const rewardUSDPerYear = getValueUSDFromAmount(rewardAmountPerYear, t.rewardTokenPrice, t.rewardToken.decimals)
            t.apr = t.totalStakedUSD <= 0 ? 0 : rewardUSDPerYear / t.totalStakedUSD * 100
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

    const updateTotalStakedValue = async () => {
        let price = 0
        let totalUSD = 0
        let allPools:IClubMapPoolInfo[]=[]
        allLivePools.map((item) => allPools.push(item))
        allExpiredPools.map((item) => allPools.push(item))
        await Promise.all(allPools.map(async (item: IClubMapPoolInfo) => {
            try {
                const chainId = getChainIdFromName(blockchain);
                const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                await fetchPoolInfo(poolContract).then(async result => {
                    await fetch(`/api/tokenPriceFromPCS?baseCurrency=${result.stakingToken}`)
                        .then((res) => res.json())
                        .then((res) => {
                            price = Number(res.price)
                        }).catch(error => { })
                    await fetchTotalStaked(poolContract).then(async amount => {
                        totalUSD += getValueUSDFromAmount(amount, price, result.stakingToken.decimals)
                    }).catch(error => {
                        console.log(error)
                    })
                })
            } catch (err) { }
            setTotalStakedValue(totalUSD)
        }))
    }

    const fetchChangedPoolAndUserInfo = async (item: IClubMapPoolInfo, poolContract: Contract) => {
        let t: IPoolAndUserInfo = { ...item.poolAndUserInfo }

        if (account) {
            const chainId = getChainIdFromName(blockchain);
            const stakeTokenContract: Contract = getContract(t.stakingToken.address, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
            const rewardTokenContract: Contract = getContract(t.rewardToken.address, ERC20_ABI, RpcProviders[chainId], account ? account : undefined)
            try {
                let bal = await stakeTokenContract.balanceOf(account)
                t.userStakeTokenBalance = bal
                bal = await rewardTokenContract.balanceOf(account)
                t.userRewardTokenBalance = bal
                bal = await nativeBalanceCallback(blockchain)
                setBnbBalance(bal)
            } catch (e) { }
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
                t.userAvailableReward = result
                t.userAvailableRewardUSD = getValueUSDFromAmount(result, t.rewardTokenPrice, t.rewardToken.decimals)
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
            t.userAvailableReward = BigNumber.from(0)
            t.userAvailableRewardUSD = 0
            t.isApprovedForMax = false
            t.userStakeTokenBalance = BigNumber.from(0)
            t.userRewardTokenBalance = BigNumber.from(0)
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

    const updateChangedPoolAndUserInfo = async (poolIndex: number) => {
        try {
            let items: IClubMapPoolInfo[]
            if (isLiveSelected) {
                items = [...pagedLivePools]
            } else {
                items = [...pagedExpiredPools]
            }
            let item = items[poolIndex]
            const chainId = getChainIdFromName(blockchain);
            const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
            let userpoolInfo = await fetchChangedPoolAndUserInfo(item, poolContract)
            item.poolAndUserInfo = userpoolInfo
            items[poolIndex] = item
            if (isLiveSelected) setPagedLivePools(items)
            else setPagedExpiredPools(items)
        } catch (error) {
            console.log(error)
        }
    }

    const setUserInfo_Approved = async (poolIndex: number) => {
        try {
            let items: IClubMapPoolInfo[]
            if (isLiveSelected) items = [...pagedLivePools]
            else items = [...pagedExpiredPools]
            let item = items[poolIndex]
            let item_pooluser = { ...item.poolAndUserInfo }
            if (item_pooluser) item_pooluser.isApprovedForMax = true
            item.poolAndUserInfo = item_pooluser
            items[poolIndex] = item
            if (isLiveSelected) setPagedLivePools(items)
            else setPagedExpiredPools(items)
        } catch (error) {
            console.log(error)
        }
    }

    const updatePagedLivePools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            if (pagedLivePools.length === 0) setIsLoadingPools(true)
            await Promise.all(
                allLivePools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allLivePools.length) : allLivePools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
            setPagedLivePools(temp)
        } catch (error) {
            console.log(error)
        }
        setIsLoadingPools(false)
    }

    const updatePagedExpiredPools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            if (pagedExpiredPools.length === 0) setIsLoadingPools(true)
            await Promise.all(
                allExpiredPools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allExpiredPools.length) : allExpiredPools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
            setPagedExpiredPools(temp)
        } catch (error) {
            console.log(error)
        }
        setIsLoadingPools(false)
    }

    return (
        <GrimaceStakingContext.Provider
            value={{
                bnbBalance,
                allLivePools,
                allExpiredPools,
                allDisabledPools,
                pagedLivePools,
                pagedExpiredPools,
                grimaceClubOwner,
                blockTimestamp,
                isLiveSelected,
                rowsPerPage,
                page,
                pageCount,
                isLoadingPools,
                totalStakedValue,

                setRowsPerPage,
                setPage,
                setPageCount,
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
                updatePoolOwnerCallback,
                updateNoNeedChargeTokenCallback,
                ownerWithdrawPayTokensCallback,
                updateClubMapPoolInfo,
                updatePagedLivePools,
                updatePagedExpiredPools,
                updateChangedPoolAndUserInfo,
                setUserInfo_Approved
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
