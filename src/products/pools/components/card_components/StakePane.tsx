import React, { useMemo, useState, useEffect, useRef } from 'react'
import { IClubMapPoolInfo, useGrimaceStakingClub } from '@app/contexts'
import { decodeTxErrorMessage, formatEther_Optimized, formatFixedNumber_Optimized } from '@app/utils/utils'
import { useApproveCallback } from '@app/hooks/hooks'
import { toast } from 'react-toastify'
import { LoadingButton } from '@mui/lab'
import { Button } from '@mui/material'

interface props {
    poolInfo: IClubMapPoolInfo
    poolIndex: number
    onStake: (item: IClubMapPoolInfo) => void
    onUnstake: (item: IClubMapPoolInfo) => void
}

const blockchain = process.env.blockchain

export default function StakePane({ poolInfo, poolIndex, onStake, onUnstake }: props) {
    const {
        isLiveSelected,
        setUserInfo_Approved
    } = useGrimaceStakingClub()
    const { approveCallback } = useApproveCallback()
    const [isEnableStaking, setIsEnableStaking] = useState(false)

    const onApprove = async () => {
        setIsEnableStaking(true)
        try {
            await approveCallback(poolInfo.poolAddress, poolInfo.poolAndUserInfo.stakingToken.address, blockchain).then((hash: string) => {
                setIsEnableStaking(false)
                setUserInfo_Approved(poolIndex)
                toast.success('Approved!')
            }).catch((error: any) => {
                console.log(error)
                setIsEnableStaking(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsEnableStaking(false)
        }
        return null
    }

    return (
        <div className='w-full sm:w-auto p-4 rounded-md border border-[#987DF9] bg-app-common xl:h-full min-w-[200px]'>
            {!poolInfo.poolAndUserInfo.isApprovedForMax && <div className='flex flex-col gap-4 justify-between h-full'>
                <div className='text-app-primary text-[12px] font-light'>{`Stake ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}</div>
                <LoadingButton
                    loading={isEnableStaking}
                    loadingPosition="center"
                    variant="contained"
                    sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                    color="secondary"
                    onClick={() => onApprove()}
                    disabled={!isLiveSelected}
                >
                    <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isEnableStaking ? '' : 'Enable Staking'}</span>
                </LoadingButton>
            </div>}
            {poolInfo.poolAndUserInfo.isApprovedForMax && <div className='flex flex-col sm:flex-row gap-4 sm:items-center'>
                <div className='w-full flex flex-col gap-1'>
                    <div className='text-app-primary text-[12px] font-light'>{`${poolInfo.poolAndUserInfo.stakingToken.symbol} Staked`}</div>
                    <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1]'>
                        {`${formatEther_Optimized(poolInfo.poolAndUserInfo.userStaked, poolInfo.poolAndUserInfo.stakingToken.decimals, 2, true)} ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}
                    </div>
                    <span className='text-app-primary text-[12px] font-light'>
                        {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.userStakedUSD, 2, true)} USD`}
                    </span>
                </div>
                <div className='w-full sm:w-auto flex flex-col gap-1 items-center'>
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                        color="secondary"
                        onClick={() => onStake(poolInfo)}
                        disabled={!isLiveSelected}
                    >
                        <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Stake</span>
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                        color="primary"
                        onClick={() => onUnstake(poolInfo)}
                        disabled={!poolInfo.poolAndUserInfo.userStaked.gt(0) || !isLiveSelected}
                    >
                        <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Unstake</span>
                    </Button>
                </div>
            </div>}
        </div>
    )
}