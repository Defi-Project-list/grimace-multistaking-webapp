import React, { useState, useEffect, useRef } from 'react'
import { IClubMapPoolInfo } from '@app/contexts'
import { formatFixedNumber_Optimized, ONEDAY_SECS } from '@app/utils/utils'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { useEthers } from '@usedapp/core'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import PoolStatusPane from './card_components/PoolStatusPane'
import UserDetailsPane from './card_components/UserDetailsPane'
import AdminDetailsPane from './card_components/AdminDetailsPane'

interface props {
    poolInfo: IClubMapPoolInfo
    poolIndex: number
    onStake: (item: IClubMapPoolInfo) => void
    onUnstake: (item: IClubMapPoolInfo) => void
}

export default function PoolCard({ poolInfo, poolIndex, onStake, onUnstake }: props) {
    const { account } = useEthers()
    const [isDetailed, setIsDetailed] = useState(false)
    const [tab, setTab] = React.useState('2')

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    const handleShowDetails = (value: boolean) => {
        setIsDetailed(value)
    }

    return (
        <div className='w-full bg-white rounded-md py-4 px-4 md:px-8 mb-6' style={{ boxShadow: '2px 2px 4px #888' }}>
            <div className={`w-full flex flex-col md:flex-row gap-2 sm:gap-4 justify-between ${isDetailed ? 'border-b-2 border-[#987DF9]' : ''}`}>
                <div className='w-full flex flex-col xl:flex-row gap-4 justify-between items-center py-2'>
                    <div className='w-full xl:basis-1/2 flex flex-col sm:flex-row justify-between sm:justify-around gap-4'>
                        <div className='w-full md:basis-1/2 flex justify-start sm:justify-start xl:justify-around gap-6 sm:gap-8 lg:gap-10'>
                            <div className='relative overflow-visible'>
                                <div className='bg-white w-[50px] relative overflow-hidden' style={{ borderRadius: '50%' }}>
                                    <img src={poolInfo.poolAndUserInfo.stakingToken.logoURI} width="100%" />
                                </div>
                                <div className='absolute bg-white w-[20px] bottom-0 right-0 border border-white overflow-hidden' style={{ borderRadius: '50%' }}>
                                    <img src={poolInfo.poolAndUserInfo.rewardToken.logoURI} width="100%" />
                                </div>
                            </div>
                            <div className=''>
                                <div className='text-[18px] md:text-[20px] text-app-primary font-bold whitespace-nowrap'>{`Earn ${poolInfo.poolAndUserInfo.rewardToken.symbol}`}</div>
                                <div className='text-[14px] md:text-[15px] text-app-primary font-bold whitespace-nowrap'>{`Stake ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}</div>
                            </div>
                        </div>
                        <div className='w-full md:basis-1/2 flex justify-start sm:justify-end xl:justify-around gap-6 sm:gap-8 lg:gap-10'>
                            <div className='flex flex-col bg-app-box rounded-md px-2 py-1 h-[51px] shadow-sm shadow-[#000] min-w-[90px]'>
                                <div className='flex gap-2 items-center'>
                                    <svg viewBox="64 64 896 896" focusable="false" fill="#341461" width="14px" height="14px" data-icon="fire" aria-hidden="true"><path d="M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9zM713 808.5c-53.7 53.2-125 82.4-201 82.4s-147.3-29.2-201-82.4c-53.5-53.1-83-123.5-83-198.4 0-43.5 9.8-85.2 29.1-124 18.8-37.9 46.8-71.8 80.8-97.9a349.6 349.6 0 0058.6-56.8c25-30.5 44.6-64.5 58.2-101a240 240 0 0012.1-46.5c24.1 22.2 44.3 49 61.2 80.4 33.4 62.6 48.8 118.3 45.8 165.7a74.01 74.01 0 0024.4 59.8 73.36 73.36 0 0053.4 18.8c19.7-1 37.8-9.7 51-24.4 13.3-14.9 24.8-30.1 34.4-45.6 14 17.9 25.7 37.4 35 58.4 15.9 35.8 24 73.9 24 113.1 0 74.9-29.5 145.4-83 198.4z"></path></svg>
                                    <span className='text-app-primary text-[12px] font-light'>APR</span>
                                </div>
                                <div className='text-app-primary text-[20px] md:text-[22px] font-bold leading-[1.1] whitespace-nowrap'>
                                    {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.apr, 2, false)}%`}
                                </div>
                            </div>
                            <div className='flex bg-app-yellow rounded-md p-2 shadow-sm shadow-[#000] h-[51px] items-center font-bold'>
                                <span className='text-app-primary text-[18px] md:text-[20px] whitespace-nowrap'>
                                    {`${formatFixedNumber_Optimized(poolInfo.poolAndUserInfo.lockDuration / ONEDAY_SECS, 2, false)} Days lock`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='w-full xl:basis-1/2 hidden md:block'>
                        <PoolStatusPane poolInfo={poolInfo} />
                    </div>
                </div>
                <div className='w-full xl:basis-1/6 md:basis-1/4 mb-4 md:mb-0 flex justify-center md:justify-end text-app-yellow text-[14px] md:text-[15px] font-bold items-center'>
                    <div className='flex gap-2 cursor-pointer items-center' onClick={() => handleShowDetails(!isDetailed)}>
                        <span className='whitespace-nowrap'>Show Details</span>
                        {isDetailed ? <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 8.5L8 1.5L1 8.5" stroke="#F3BA2F" strokeWidth="2" />
                        </svg> :
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L8 8.5L15 1.5" stroke="#F3BA2F" strokeWidth="2" />
                            </svg>}
                    </div>
                </div>
            </div>
            <div className={`w-full ${isDetailed ? 'block' : 'hidden'}`}>
                {poolInfo.owner == account ? <div className="w-full"><TabContext value={tab}>
                    <TabList onChange={handleTabChange} aria-label="">
                        <Tab label="Stake" value="1" />
                        <Tab label="PoolAdmin" value="2" />
                    </TabList>
                    <TabPanel value="1">
                        <UserDetailsPane isDetailed={isDetailed} poolInfo={poolInfo} poolIndex={poolIndex} onStake={onStake} onUnstake={onUnstake} />
                    </TabPanel>
                    <TabPanel value="2">
                        <AdminDetailsPane isDetailed={isDetailed} poolInfo={poolInfo} poolIndex={poolIndex} />
                    </TabPanel>
                </TabContext>
                </div> :
                    <UserDetailsPane isDetailed={isDetailed} poolInfo={poolInfo} poolIndex={poolIndex} onStake={onStake} onUnstake={onUnstake} />
                }
            </div>
        </div>
    )
}