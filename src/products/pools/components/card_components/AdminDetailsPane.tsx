import React, { useMemo, useState, useEffect, useRef } from 'react'
import { IClubMapPoolInfo, useGrimaceStakingClub } from '@app/contexts'
import { decodeTxErrorMessage, formatEther_Optimized, formatFixedNumber_Optimized, getShortDate_, ONEDAY_SECS } from '@app/utils/utils'
import { LoadingButton } from '@mui/lab'
import { toast } from 'react-toastify'
import PoolStopDate from '@app/products/register/components/forms/form_components/PoolStopDate'
import { BigNumber } from 'ethers'
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units'
import RewardPerBlockInput from '@app/products/register/components/forms/form_components/RewardPerBlockInput'
import StakerLockTimeInput from '@app/products/register/components/forms/form_components/StakerLockTimeInput'
import WithdrawRewardInput from './WithdrawRewardInput'

interface props {
    isDetailed: boolean
    poolInfo: IClubMapPoolInfo
    poolIndex: number
}

const ID_REWARD_PER_BLOCK = 'id_admin_change_rewardperblock'
const ID_STAKER_LOCK_TIME = 'id_admin_stakerlocktime'
const ID_END_TIME = 'id_admin_change_endtime'
const ID_WITHDRAW_REWARD = 'id_admin_withdraw_reward'

export default function AdminDetailsPane({ isDetailed, poolInfo, poolIndex }: props) {
    const {
        resumeStakingCallback,
        stopStakingCallback,
        updateEndTimeCallback,
        updateRewardPerBlockCallback,
        updateLockDurationCallback,
        emergencyRewardWithdrawCallback,
        updateAdminChangedPool,
    } = useGrimaceStakingClub()
    const [isSettingAllowReward, setIsSettingAllowReward] = useState(false)
    const [isSettingEndTime, setIsSettingEndTime] = useState(false)
    const [endTime, setEndTime] = useState(0)
    const [rewardPerBlock, setRewardPerBlock] = useState(BigNumber.from(0))
    const [isSettingRewardPerBlock, setIsSettingRewardPerBlock] = useState(false)
    const [isSettingStakerLockTime, setIsSettingStakerLockTime] = useState(false)
    const [stakerLockTime, setStakerLockTime] = useState(0)
    const [withdrawAmount, setWithdrawAmount] = useState(BigNumber.from(0))
    const [isWithdrawingReward, setIsWithdrawingReward] = useState(false)

    useEffect(() => {
        if (poolInfo.poolAndUserInfo) {
            setRewardPerBlockBoxValue(poolInfo.poolAndUserInfo.rewardPerBlock)
            setRewardPerBlock(poolInfo.poolAndUserInfo.rewardPerBlock)
            setStakerLockTimeBoxValue(poolInfo.poolAndUserInfo.lockDuration)
            setStakerLockTime(poolInfo.poolAndUserInfo.lockDuration)
            setEndTimeBoxValue(poolInfo.poolAndUserInfo.endTime)
            setEndTime(poolInfo.poolAndUserInfo.endTime)
        }
    }, [])

    const onWithdrawRewardAmount = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), poolInfo.poolAndUserInfo.rewardToken.decimals)
            else amount = parseUnits(val, poolInfo.poolAndUserInfo.rewardToken.decimals)
        }
        console.log(val)
        console.log(formatEther(amount))
        setWithdrawAmount(amount)
    }

    const setWithdrawRewardBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_WITHDRAW_REWARD + poolIndex)
        if (element) element.value = formatUnits(val, poolInfo.poolAndUserInfo.rewardToken.decimals)
    }

    const onStakerLockTimeChange = (val: string) => {
        let amount = 0
        if (val.length > 0) {
            amount = Math.floor(Number(val) * ONEDAY_SECS)
        }
        setStakerLockTime(amount)
    }

    const setStakerLockTimeBoxValue = (val: number) => {
        let element: any = document.getElementById(ID_STAKER_LOCK_TIME + poolIndex)
        if (element) element.value = val / ONEDAY_SECS
    }

    const onEndTimeChange = (d: Date) => {
        let timestamp = ((new Date(d)).getTime() / 1000)
        timestamp = Math.floor(timestamp / ONEDAY_SECS) * ONEDAY_SECS
        setEndTime(timestamp)
    }

    const setEndTimeBoxValue = (val: number) => {
        let element: any = document.getElementById(ID_END_TIME + poolIndex)
        if (element) element.value = getShortDate_(new Date(val * 1000))
    }

    const onRewardPerBlockChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), poolInfo.poolAndUserInfo.rewardToken.decimals)
            else amount = parseUnits(val, poolInfo.poolAndUserInfo.rewardToken.decimals)
        }
        setRewardPerBlock(amount)
    }

    const setRewardPerBlockBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_REWARD_PER_BLOCK + poolIndex)
        if (element) element.value = formatUnits(val, poolInfo.poolAndUserInfo.rewardToken.decimals)
    }

    const onWithdrawReward = async () => {
        setIsWithdrawingReward(true)
        try {
            await emergencyRewardWithdrawCallback(withdrawAmount, poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsWithdrawingReward(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsWithdrawingReward(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsWithdrawingReward(false)
        }
        return null
    }


    const onSetStakerLockTime = async () => {
        setIsSettingStakerLockTime(true)
        try {
            await updateLockDurationCallback(BigNumber.from(stakerLockTime), poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsSettingStakerLockTime(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsSettingStakerLockTime(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsSettingStakerLockTime(false)
        }
        return null
    }

    const onSetRewardPerBlock = async () => {
        setIsSettingRewardPerBlock(true)
        try {
            await updateRewardPerBlockCallback(rewardPerBlock, poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsSettingRewardPerBlock(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsSettingRewardPerBlock(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsSettingRewardPerBlock(false)
        }
        return null
    }

    const onSetEndTime = async () => {
        setIsSettingEndTime(true)
        try {
            await updateEndTimeCallback(BigNumber.from(endTime), poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsSettingEndTime(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsSettingEndTime(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsSettingEndTime(false)
        }
        return null
    }

    const onSetResumeReward = async () => {
        setIsSettingAllowReward(true)
        try {
            await resumeStakingCallback(poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsSettingAllowReward(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsSettingAllowReward(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsSettingAllowReward(false)
        }
        return null
    }

    const onSetStopReward = async () => {
        setIsSettingAllowReward(true)
        try {
            await stopStakingCallback(poolInfo.poolAddress).then((res: any) => {
                if (res.status === 1) {
                    setIsSettingAllowReward(false)
                    updateAdminChangedPool(poolIndex)
                    toast.success('Success!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsSettingAllowReward(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsSettingAllowReward(false)
        }
        return null
    }

    return (
        <div className={`w-full flex-col gap-4 ${isDetailed ? 'flex' : 'hidden'}`}>
            <div className='w-full flex flex-col lg:flex-row gap-4 lg:justify-around items-center'>
                <div className='flex flex-col gap-1'>
                    <div className='flex gap-2 items-center'>
                        <span className='text-app-primary text-[12px] font-light'>Total Claimed</span>
                    </div>
                    <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1]'>
                        {`${formatEther_Optimized(poolInfo.poolAndUserInfo.totalClaimed, poolInfo.poolAndUserInfo.rewardToken.decimals, 2, true)} ${poolInfo.poolAndUserInfo.rewardToken.symbol}`}
                    </div>
                    <span className='text-app-primary text-[12px] font-light'>
                        {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.totalClaimedUSD, 2, true)} USD`}
                    </span>
                </div>
                <div className='flex flex-col gap-1'>
                    <div className='flex gap-2 items-center'>
                        <span className='text-app-primary text-[12px] font-light'>Remaining Reward</span>
                    </div>
                    <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1]'>
                        {`${formatEther_Optimized(poolInfo.poolAndUserInfo.rewardRemaining, poolInfo.poolAndUserInfo.rewardToken.decimals, 2, true)} ${poolInfo.poolAndUserInfo.rewardToken.symbol}`}
                    </div>
                    <span className='text-app-primary text-[12px] font-light'>
                        {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.rewardRemainingUSD, 2, true)} USD`}
                    </span>
                </div>
                <div className='w-full lg:w-auto min-w-[200px]'>
                    {poolInfo.poolAndUserInfo.isEndedStaking ?
                        <LoadingButton
                            loading={isSettingAllowReward}
                            loadingPosition="center"
                            variant="contained"
                            sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                            color="primary"
                            onClick={() => onSetResumeReward()}
                            disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                        >
                            <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isSettingAllowReward ? '' : 'Resume Reward'}</span>
                        </LoadingButton>
                        :
                        <LoadingButton
                            loading={isSettingAllowReward}
                            loadingPosition="center"
                            variant="contained"
                            sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                            color="primary"
                            onClick={() => onSetStopReward()}
                            disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                        >
                            <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isSettingAllowReward ? '' : 'Stop Reward'}</span>
                        </LoadingButton>
                    }
                </div>
            </div>
            <div className='w-full flex flex-col gap-4 items-center'>
                <div className='w-full lg:basis-1/2 flex flex-col lg:flex-row gap-6'>
                    <div className='w-full lg:basis-1/2 flex gap-4 items-center'>
                        <PoolStopDate id={ID_END_TIME + poolIndex} setEndTime={onEndTimeChange} />
                        <div className='min-w-[150px]'>
                            <LoadingButton
                                loading={isSettingEndTime}
                                loadingPosition="center"
                                variant="contained"
                                sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                color="primary"
                                onClick={() => onSetEndTime()}
                                disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                            >
                                <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isSettingEndTime ? '' : 'Set'}</span>
                            </LoadingButton>
                        </div>
                    </div>
                    <div className='w-full lg:basis-1/2 flex gap-4 items-center'>
                        <RewardPerBlockInput id={ID_REWARD_PER_BLOCK + poolIndex} onChange={onRewardPerBlockChange} />
                        <div className='min-w-[150px]'>
                            <LoadingButton
                                loading={isSettingRewardPerBlock}
                                loadingPosition="center"
                                variant="contained"
                                sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                color="primary"
                                onClick={() => onSetRewardPerBlock()}
                                disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                            >
                                <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isSettingRewardPerBlock ? '' : 'Set'}</span>
                            </LoadingButton>
                        </div>
                    </div>
                </div>
                <div className='w-full lg:basis-1/2 flex flex-col lg:flex-row gap-6'>
                    <div className='w-full lg:basis-1/2 flex gap-4 items-center'>
                        <StakerLockTimeInput id={ID_STAKER_LOCK_TIME + poolIndex} onChange={onStakerLockTimeChange} />
                        <div className='min-w-[150px]'>
                            <LoadingButton
                                loading={isSettingStakerLockTime}
                                loadingPosition="center"
                                variant="contained"
                                sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                color="primary"
                                onClick={() => onSetStakerLockTime()}
                                disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                            >
                                <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isSettingStakerLockTime ? '' : 'Set'}</span>
                            </LoadingButton>
                        </div>
                    </div>
                    <div className='w-full lg:basis-1/2 flex gap-4 items-center'>
                        <WithdrawRewardInput id={ID_WITHDRAW_REWARD + poolIndex} onChange={onWithdrawRewardAmount} />
                        <div className='min-w-[150px]'>
                            <LoadingButton
                                loading={isWithdrawingReward}
                                loadingPosition="center"
                                variant="contained"
                                sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                color="primary"
                                onClick={() => onWithdrawReward()}
                                disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0)}
                            >
                                <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isWithdrawingReward ? '' : 'Withdraw'}</span>
                            </LoadingButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}