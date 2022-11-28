/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from "@usedapp/core";
import { getContract, calculateGasMargin, isWrappedEther, isAddress, ONEDAY_SECS, BSC_BLOCKTIME, isToken, isInAddresses } from '@app/utils/utils'
import { TransactionResponse } from '@ethersproject/providers'
import { RpcProviders, GrimaceClubAddress, AppTokenAddress, ZERO_ADDRESS } from "src/constants/AppConstants"
import useRefresh from 'src/hooks/useRefresh'
import { getChainIdFromName } from '@app/utils/utils'
import grimaceFactoryAbi from '@app/constants/contracts/abis/grimaceStakingClub.json'
import poolAbi from '@app/constants/contracts/abis/grimaceStakingPool.json'
import ERC20_ABI from '@app/constants/contracts/abis/erc20.json'
import { useNativeTokenBalance, useTokenBalanceCallback } from 'src/hooks/hooks'
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { useTokenPrice } from "@app/hooks/useTokenPrice"
import { replace_logo_urls} from "@app/constants/AppConstants"

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
    lastRewardBlock: number
    accRewardPerShare: BigNumber
    rewardPerBlock: BigNumber
    poolOwner: string
    lockDuration: number
    endTime: number

    totalStaked: BigNumber
    totalStakedUSD: number
    totalClaimed: BigNumber
    totalClaimedUSD: number
    rewardRemaining: BigNumber
    rewardRemainingUSD: number
    isEndedStaking: boolean

    apr: number
}

export interface IClubMapPoolInfo {
    poolAddress: string
    poolAndUserInfo: IPoolAndUserInfo
    owner: string
    stakingToken: string
    rewardToken: string
    createdAt: number
}

export interface IGrimaceStakingContext {
    bnbBalance: BigNumber
    filteredLivePools: IClubMapPoolInfo[]
    filteredExpiredPools: IClubMapPoolInfo[]
    filteredDisabledPools: IClubMapPoolInfo[]
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
    updateAdminChangedPool: (poolIndex: number) => void
    updateTotalStakedValue: () => void
    setUserInfo_Approved: (poolIndex: number) => void
    setSearchAddress: (searchText: string) => void
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

    const [filteredLivePools, setFilteredLivePools] = useState<IClubMapPoolInfo[]>([])
    const [filteredExpiredPools, setFilteredExpiredPools] = useState<IClubMapPoolInfo[]>([])
    const [filteredDisabledPools, setFilteredDisabledPools] = useState<IClubMapPoolInfo[]>([])

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

    const [queueLivePools, setQueueLivePools] = useState({ pagedProps: '', data: undefined })
    const [queueExpiredPools, setQueueExpiredPools] = useState({ pagedProps: '', data: undefined })
    const [queueAdminChanged, setQueueAdminChanged] = useState({ pagedProps: '', data: undefined })
    const [queuePoolAndUserChanged, setQueuePoolAndUserChanged] = useState({ pagedProps: '', data: undefined })
    const [queueApproveChanged, setQueueApproveChanged] = useState({ pagedProps: '', data: undefined })

    const [pagedProps, setPagedProps] = useState('')

    const [searchAddress, setSearchAddress] = useState('')

    const { getTokenPrice } = useTokenPrice()
    
    useEffect(() => {
        if (isLiveSelected) {
            if (filteredLivePools) setPageCount(rowsPerPage > 0 ? Math.ceil(filteredLivePools.length / rowsPerPage) : 0)
            else setPageCount(0)
            setPage(1)
        } else {
            if (filteredExpiredPools) setPageCount(rowsPerPage > 0 ? Math.ceil(filteredExpiredPools.length / rowsPerPage) : 0)
            else setPageCount(0)
            setPage(1)
        }
    }, [rowsPerPage, isLiveSelected, filteredLivePools, filteredExpiredPools])

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
        if (isAddress(searchAddress)) {
            let filtered: IClubMapPoolInfo[] = allLivePools.filter((item) => isInAddresses([item.poolAddress, item.stakingToken, item.rewardToken], searchAddress))
            setFilteredLivePools([...filtered])
        } else {
            if (searchAddress.length <= 0) {
                setFilteredLivePools([...allLivePools])
            } else {
                setFilteredLivePools([])
            }
        }
    }, [searchAddress, allLivePools])

    useEffect(() => {
        if (isAddress(searchAddress)) {
            let filtered: IClubMapPoolInfo[] = allExpiredPools.filter((item) => isInAddresses([item.poolAddress, item.stakingToken, item.rewardToken], searchAddress))
            setFilteredExpiredPools([...filtered])
        } else {
            if (searchAddress.length <= 0) {
                setFilteredExpiredPools([...allExpiredPools])
            } else {
                setFilteredExpiredPools([])
            }
        }
    }, [searchAddress, allExpiredPools])

    useEffect(() => {
        updateTotalStakedValue()
    }, [slowRefresh, allLivePools, allExpiredPools])

    useEffect(() => {
        setPagedProps(`${account ? account.toLowerCase() : ''}_${rowsPerPage}_${page}_${isLiveSelected}_${searchAddress.toLowerCase()}`)
    }, [account, rowsPerPage, page, isLiveSelected])

    useEffect(() => {
        if (isLiveSelected) {
            setIsLoadingPools(true)
            setPagedLivePools([])
            if (filteredLivePools.length > 0) updatePagedLivePools()
        }
    }, [pagedProps, filteredLivePools])

    useEffect(() => {
        if (!isLiveSelected) {
            setIsLoadingPools(true)
            setPagedExpiredPools([])
            if (filteredExpiredPools.length > 0) updatePagedExpiredPools()
        }
    }, [pagedProps, filteredExpiredPools])

    useEffect(() => {
        if (!isLoadingPools) {
            if (isLiveSelected) {
                updatePagedLivePools()
            } else {
                updatePagedExpiredPools()
            }
        }
    }, [normalRefresh])

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

    const fetchPoolAndUserStatus = async (_user: string, poolContract: Contract) => {
        const res = await poolContract.getPoolAndUserStatus(_user)
        return res
    }

    const fetchPoolStatus = async (poolContract: Contract) => {
        const res = await poolContract.getPoolStatus()
        return res
    }

    const fetchUserStatus = async (_user: string, poolContract: Contract) => {
        const res = await poolContract.getUserStatus(_user)
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
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, stakingToken: item.stakingToken, rewardToken: item.rewardToken, createdAt: Number(item.createdAt) })
                })
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllLivePools(temp)
                temp = []

                expiredPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, stakingToken: item.stakingToken, rewardToken: item.rewardToken, createdAt: Number(item.createdAt) })
                })
                temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
                setAllExpiredPools(temp)
                temp = []

                disabledPools.map(async (item) => {
                    temp.push({ poolAddress: item.poolAddress, poolAndUserInfo: undefined, owner: item.owner, stakingToken: item.stakingToken, rewardToken: item.rewardToken, createdAt: Number(item.createdAt) })
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
            stakingToken: undefined, rewardToken: undefined, websiteURL: '', lastRewardBlock: 0, accRewardPerShare: BigNumber.from(0),
            rewardPerBlock: BigNumber.from(0), poolOwner: '', lockDuration: 0, endTime: 0, totalStaked: BigNumber.from(0), totalStakedUSD: 0,
            totalClaimed: BigNumber.from(0), totalClaimedUSD: 0, rewardRemaining: BigNumber.from(0), rewardRemainingUSD: 0, isEndedStaking: false, apr: 0
        }
        await fetchPoolStatus(poolContract).then(async result => {
            let stakeTokenLogo = result[6].stakeTokenLogo
            let rewardTokenLogo = result[6].rewardTokenLogo
            let index = replace_logo_urls.findIndex((item) => item.slogo == stakeTokenLogo)
            if (index>=0) stakeTokenLogo = replace_logo_urls[index].dlogo
            index = replace_logo_urls.findIndex((item) => item.slogo == rewardTokenLogo)
            if (index>=0) rewardTokenLogo = replace_logo_urls[index].dlogo
            t.stakingToken = { address: result[4].tokenAddress, name: result[4].name, symbol: result[4].symbol, decimals: Number(result[4].decimals), logoURI: stakeTokenLogo }
            t.rewardToken = { address: result[5].tokenAddress, name: result[5].name, symbol: result[5].symbol, decimals: Number(result[5].decimals), logoURI: rewardTokenLogo }
            t.websiteURL = result[6].websiteURL
            let res = await getTokenPrice({ tokenAddress: t.stakingToken.address, decimals: t.stakingToken.decimals })
            t.stakingTokenPrice = Number(res.price)
            // await fetch(`/api/tokenPriceFromPCS?baseCurrency=${t.stakingToken.address}`)
            //     .then((res) => res.json())
            //     .then((res) => {
            //         t.stakingTokenPrice = Number(res.price)
            //     }).catch(error => { })
            res = await getTokenPrice({ tokenAddress: t.rewardToken.address, decimals: t.rewardToken.decimals })
            t.rewardTokenPrice = Number(res.price)
            // await fetch(`/api/tokenPriceFromPCS?baseCurrency=${t.rewardToken.address}`)
            //     .then((res) => res.json())
            //     .then((res) => {
            //         t.rewardTokenPrice = Number(res.price)
            //     }).catch(error => { })
            t.lastRewardBlock = Number(result[6].lastRewardBlock)
            t.accRewardPerShare = result[6].accRewardPerShare
            t.rewardPerBlock = result[6].rewardPerBlock
            t.poolOwner = result[6].poolOwner
            t.lockDuration = Number(result[6].lockDuration)
            t.endTime = Number(result[6].endTime)

            t.totalStaked = result[0]
            t.totalStakedUSD = getValueUSDFromAmount(result[0], t.stakingTokenPrice, t.stakingToken.decimals)
            const oneYearBlocks = 365 * ONEDAY_SECS / BSC_BLOCKTIME
            const rewardAmountPerYear = t.rewardPerBlock.mul(BigNumber.from(oneYearBlocks))
            const rewardUSDPerYear = getValueUSDFromAmount(rewardAmountPerYear, t.rewardTokenPrice, t.rewardToken.decimals)
            t.apr = t.totalStakedUSD <= 0 ? 0 : rewardUSDPerYear / t.totalStakedUSD * 100

            t.totalClaimed = result[1]
            t.totalClaimedUSD = getValueUSDFromAmount(result[1], t.rewardTokenPrice, t.rewardToken.decimals)

            t.rewardRemaining = result[2]
            t.rewardRemainingUSD = getValueUSDFromAmount(result[2], t.rewardTokenPrice, t.rewardToken.decimals)

            t.isEndedStaking = result[3]
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

            await fetchUserStatus(account, poolContract).then(async result => {
                t.userAvailableReward = result[0]
                t.userAvailableRewardUSD = getValueUSDFromAmount(result[0], t.rewardTokenPrice, t.rewardToken.decimals)
                t.userStaked = result[1].amount
                t.userStakedUSD = getValueUSDFromAmount(result[1].amount, t.stakingTokenPrice, t.stakingToken.decimals)
                t.userUnlockTime = Number(result[1].unlockTime)
                t.userTotalEarned = result[1].totalEarned
                t.userTotalEarnedUSD = getValueUSDFromAmount(result[1].totalEarned, t.rewardTokenPrice, t.rewardToken.decimals)
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
        return t
    }

    const updateTotalStakedValue = async () => {
        let price = 0
        let totalUSD = 0
        let allPools: IClubMapPoolInfo[] = []
        allLivePools.map((item) => allPools.push(item))
        allExpiredPools.map((item) => allPools.push(item))
        let isNewCalc = totalStakedValue > 0 ? false : true
        let prices: any[] = []
        await Promise.all(allPools.map(async (item: IClubMapPoolInfo) => {
            try {
                const chainId = getChainIdFromName(blockchain);
                const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                await fetchPoolStatus(poolContract).then(async result => {
                    const stakingToken = result[6].stakingToken
                    const i = prices.findIndex((t: any) => isToken(t.token, stakingToken))
                    if (i >= 0) {
                        price = prices[i].price
                    } else {
                        let res = await getTokenPrice({ tokenAddress: stakingToken, decimals: Number(result[4].decimals) })
                        price = Number(res.price)
                        prices.push({ token: stakingToken, price: price })
                        // await fetch(`/api/tokenPriceFromPCS?baseCurrency=${stakingToken}`)
                        //     .then((res) => res.json())
                        //     .then((res) => {
                        //         price = Number(res.price)
                        //         prices.push({ token: stakingToken, price: price })
                        //     }).catch(error => { })
                    }
                    totalUSD += getValueUSDFromAmount(result[0], price, Number(result[4].decimals))
                })
            } catch (err) { }
            if (isNewCalc) setTotalStakedValue(totalUSD)
        }))
        setTotalStakedValue(totalUSD)
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
            await fetchUserStatus(account, poolContract).then(async result => {
                t.userAvailableReward = result[0]
                t.userAvailableRewardUSD = getValueUSDFromAmount(result[0], t.rewardTokenPrice, t.rewardToken.decimals)
                t.userStaked = result[1].amount
                t.userStakedUSD = getValueUSDFromAmount(result[1].amount, t.stakingTokenPrice, t.stakingToken.decimals)
                t.userUnlockTime = Number(result[1].unlockTime)
                t.userTotalEarned = result[1].totalEarned
                t.userTotalEarnedUSD = getValueUSDFromAmount(result[1].totalEarned, t.rewardTokenPrice, t.rewardToken.decimals)
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
        await fetchPoolStatus(poolContract).then(async result => {
            t.totalStaked = result[0]
            t.totalStakedUSD = getValueUSDFromAmount(result[0], t.stakingTokenPrice, t.stakingToken.decimals)
            const oneYearBlocks = 365 * ONEDAY_SECS / BSC_BLOCKTIME
            const rewardAmountPerYear = t.rewardPerBlock.mul(BigNumber.from(oneYearBlocks))
            const rewardUSDPerYear = getValueUSDFromAmount(rewardAmountPerYear, t.rewardTokenPrice, t.rewardToken.decimals)
            t.apr = t.totalStakedUSD <= 0 ? 0 : rewardUSDPerYear / t.totalStakedUSD * 100

            t.totalClaimed = result[1]
            t.totalClaimedUSD = getValueUSDFromAmount(result[1], t.rewardTokenPrice, t.rewardToken.decimals)

            t.rewardRemaining = result[2]
            t.rewardRemainingUSD = getValueUSDFromAmount(result[2], t.rewardTokenPrice, t.rewardToken.decimals)

            t.isEndedStaking = result[3]
        }).catch(error => {
            console.log(error)
        })
        return t
    }

    useEffect(() => {
        if (queuePoolAndUserChanged.data) {
            if (queuePoolAndUserChanged.pagedProps === pagedProps) {
                if (isLiveSelected) setPagedLivePools(queuePoolAndUserChanged.data)
                else setPagedExpiredPools(queuePoolAndUserChanged.data)
            }
        }
    }, [queuePoolAndUserChanged])

    const updateChangedPoolAndUserInfo = async (poolIndex: number) => {
        try {
            let items: IClubMapPoolInfo[]
            let prePagedProps = pagedProps
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
            setQueuePoolAndUserChanged({ pagedProps: prePagedProps, data: items })
        } catch (error) {
            console.log(error)
        }
    }

    const fetchAdminChangedPool = async (item: IClubMapPoolInfo, poolContract: Contract) => {
        let t: IPoolAndUserInfo = { ...item.poolAndUserInfo }
        await fetchPoolStatus(poolContract).then(async result => {
            t.lastRewardBlock = Number(result[6].lastRewardBlock)
            t.accRewardPerShare = result[6].accRewardPerShare
            t.rewardPerBlock = result[6].rewardPerBlock
            t.lockDuration = Number(result[6].lockDuration)
            t.endTime = Number(result[6].endTime)
            t.isEndedStaking = result[3]
            t.rewardRemaining = result[2]
            t.rewardRemainingUSD = getValueUSDFromAmount(result[2], t.rewardTokenPrice, t.rewardToken.decimals)
        }).catch(error => {
            console.log(error)
        })
        return t
    }

    useEffect(() => {
        if (queueAdminChanged.data) {
            if (queueAdminChanged.pagedProps === pagedProps) {
                if (isLiveSelected) setPagedLivePools(queueAdminChanged.data)
                else setPagedExpiredPools(queueAdminChanged.data)
            }
        }
    }, [queueAdminChanged])

    const updateAdminChangedPool = async (poolIndex: number) => {
        try {
            let items: IClubMapPoolInfo[]
            let prePagedProps = pagedProps
            if (isLiveSelected) {
                items = [...pagedLivePools]
            } else {
                items = [...pagedExpiredPools]
            }
            let item = items[poolIndex]
            const chainId = getChainIdFromName(blockchain);
            const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
            let userpoolInfo = await fetchAdminChangedPool(item, poolContract)
            item.poolAndUserInfo = userpoolInfo
            items[poolIndex] = item
            setQueueAdminChanged({ pagedProps: prePagedProps, data: items })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (queueApproveChanged.data) {
            if (queueApproveChanged.pagedProps === pagedProps) {
                if (isLiveSelected) setPagedLivePools(queueApproveChanged.data)
                else setPagedExpiredPools(queueApproveChanged.data)
            }
        }
    }, [queueApproveChanged])

    const setUserInfo_Approved = async (poolIndex: number) => {
        try {
            let items: IClubMapPoolInfo[]
            let prePagedProps = pagedProps
            if (isLiveSelected) items = [...pagedLivePools]
            else items = [...pagedExpiredPools]
            let item = items[poolIndex]
            let item_pooluser = { ...item.poolAndUserInfo }
            if (item_pooluser) item_pooluser.isApprovedForMax = true
            item.poolAndUserInfo = item_pooluser
            items[poolIndex] = item
            setQueueApproveChanged({ pagedProps: prePagedProps, data: items })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log(queueLivePools.pagedProps, pagedProps)
        if (queueLivePools.data) {
            if (queueLivePools.pagedProps === pagedProps) {
                setPagedLivePools(queueLivePools.data)
                setIsLoadingPools(false)
            }
        }
    }, [queueLivePools])

    const updatePagedLivePools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            let prePagedProps = pagedProps
            if (pagedLivePools.length === 0) setIsLoadingPools(true)
            await Promise.all(
                filteredLivePools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allLivePools.length) : allLivePools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
            // if (pagedLivePools.length === 0) {
            //     setPagedLivePools(temp)
            // } else {
            setQueueLivePools({ pagedProps: prePagedProps, data: temp })
            // }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (queueExpiredPools.data) {
            if (queueExpiredPools.pagedProps === pagedProps) {
                setPagedExpiredPools(queueExpiredPools.data)
                setIsLoadingPools(false)
            }
        }
    }, [queueExpiredPools])

    const updatePagedExpiredPools = async () => {
        try {
            let temp: IClubMapPoolInfo[] = []
            let prePagedProps = pagedProps
            if (pagedExpiredPools.length === 0) setIsLoadingPools(true)
            await Promise.all(
                filteredExpiredPools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allExpiredPools.length) : allExpiredPools.length)
                    .map(async (item: IClubMapPoolInfo, index: number) => {
                        const chainId = getChainIdFromName(blockchain);
                        const poolContract: Contract = getContract(item.poolAddress, poolAbi, RpcProviders[chainId], account ? account : undefined)
                        const t: IPoolAndUserInfo = await fetchPoolAndUserInfo(item, poolContract)
                        temp.push({ ...item, poolAndUserInfo: t })
                    })
            )
            temp.sort((a: IClubMapPoolInfo, b: IClubMapPoolInfo) => a.createdAt - b.createdAt)
            // if (pagedExpiredPools.length === 0) {
            //     setPagedExpiredPools(temp)
            // } else {
            setQueueExpiredPools({ pagedProps: prePagedProps, data: temp })
            // }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <GrimaceStakingContext.Provider
            value={{
                bnbBalance,
                filteredLivePools,
                filteredExpiredPools,
                filteredDisabledPools,
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
                updateAdminChangedPool,
                updateTotalStakedValue,
                setUserInfo_Approved,
                setSearchAddress
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
