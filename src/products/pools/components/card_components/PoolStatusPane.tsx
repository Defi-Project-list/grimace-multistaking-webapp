import React, { useMemo, useState, useEffect, useRef } from 'react'
import { IClubMapPoolInfo, useGrimaceStakingClub } from '@app/contexts'
import { BSC_BLOCKTIME, formatEther_Optimized, formatFixedNumber_Optimized, ONEDAY_SECS } from '@app/utils/utils'

interface props {
    poolInfo: IClubMapPoolInfo    
}

export default function PoolStatusPane({ poolInfo }: props) {
    const {        
        isLiveSelected,
        blockTimestamp    
    } = useGrimaceStakingClub()

    const getRemainSecs = () => {
        let remainsecs = poolInfo.poolAndUserInfo.endTime - blockTimestamp
        if (remainsecs < 0) remainsecs = 0
        return remainsecs
    }

    return (
        <div className='w-full xl:basis-1/2 flex flex-col md:flex-row justify-between xl:justify-around gap-4'>
            <div className='flex flex-col gap-1'>
                <div className='flex gap-2 items-center'>
                    <svg viewBox="64 64 896 896" focusable="false" fill="#7A30E0" width="14px" height="14px" data-icon="lock" aria-hidden="true"><path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"></path></svg>
                    <span className='text-app-primary text-[12px] font-light'>Total Staked</span>
                </div>
                <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1]'>
                    {`${formatEther_Optimized(poolInfo.poolAndUserInfo.totalStaked, poolInfo.poolAndUserInfo.stakingToken.decimals, 2, true)} ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}
                </div>
                <span className='text-app-primary text-[12px] font-light'>
                    {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.totalStakedUSD, 2, true)} USD`}
                </span>
            </div>
            <div className='flex flex-col gap-1'>
                <div className='flex gap-2 items-center'>
                    <svg viewBox="64 64 896 896" focusable="false" fill="#7A30E0" width="14px" height="14px" data-icon="clock-circle" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"></path></svg>
                    <span className='text-app-primary text-[12px] font-light'>Ends in</span>
                </div>
                <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1]'>
                    {isLiveSelected ? `${formatFixedNumber_Optimized(getRemainSecs() / ONEDAY_SECS, 2, false)} Days Left` : 'Expired'}
                </div>
                {isLiveSelected && <span className='text-app-primary text-[12px] font-light'>
                    {`${Math.floor(getRemainSecs() / BSC_BLOCKTIME)} Blocks`}
                </span>}
            </div>
        </div>
    )
}