import React, { useState, useEffect, useRef } from 'react'
import { AppTokenAddress } from "@app/constants/AppConstants"
import { useRouter } from 'next/router'
import { Button, SelectChangeEvent } from '@mui/material'
import { SidebarItem, SIDEBAR_ROUTES } from '@app/common/layout/LayoutConstants'
import PoolsBar from './components/PoolsBar'
import PoolCard from './components/PoolCard'
import PaginationKit from '@app/common/components/PaginationKit'
import StakeModal from './components/StakeModal'
import { IClubMapPoolInfo, IPoolAndUserInfo, useGrimaceStakingClub } from '@app/contexts'
import LoadingPoolCard from './components/LoadingPoolCard'
import UnstakeModal from './components/UnstakeModal'

export default function Pools() {
    const router = useRouter()
    const {
        isLiveSelected,
        rowsPerPage,
        page,
        pageCount,
        pagedLivePools,
        pagedExpiredPools,
        isLoadingPools,
        allLivePools,
        allExpiredPools,
        setPage,
        setRowsPerPage,
        setIsLiveSelected,
        setPageCount
    } = useGrimaceStakingClub()
    const [isOpenStakeModal, setIsOpenStakeModal] = useState(false)
    const [isOpenUnstakeModal, setIsOpenUnstakeModal] = useState(false)
    const [modalInfo, setModalInfo] = useState<IClubMapPoolInfo>()

    const onSelectPage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value)
    }

    const onRegister = () => {
        router.push({
            pathname: SIDEBAR_ROUTES[SidebarItem.REGISTER]
        })
    }

    const onStake = (item: IClubMapPoolInfo) => {
        setModalInfo({ ...item})
        setIsOpenStakeModal(true)
    }

    const onUnstake = (item: IClubMapPoolInfo) => {
        setModalInfo({ ...item})
        setIsOpenStakeModal(true)
    }

    return (
        <div className='w-full bg-app-common'>
            {modalInfo && <StakeModal isOpen={isOpenStakeModal} poolInfo={modalInfo} handleClose={() => setIsOpenStakeModal(false)} />}
            {modalInfo && <UnstakeModal isOpen={isOpenUnstakeModal} poolInfo={modalInfo} handleClose={() => setIsOpenUnstakeModal(false)} />}
            <div className={`w-full flex justify-center items-center h-screen lg:min-h-[480px] lg:h-auto bg-[#FFFFFF] bg-[url('splash.png')] bg-center bg-cover bg-no-repeat`}>
                <div className='w-full px-5 md:px-6 xl:px-8 flex gap-8 flex-col lg:flex-row lg:justify-between items-center'>
                    <div className='w-full flex flex-col lg:flex-row gap-2 lg:gap-4 xl:gap-8 items-center'>
                        <div className='logo-size'>
                            <img src='./images/Logomark_GrimaceCoin.png' width="100%" />
                        </div>
                        <div className='w-full flex flex-col'>
                            <div className='hidden sm:flex max-w-[768px] flex-col lg:flex-row gap-2'>
                                <img src='./images/grimacestakingclub_small.png' width="100%" />
                            </div>
                            <div className='flex sm:hidden w-full max-w-[400px] px-4 flex-col lg:flex-row gap-2 mt-4'>
                                <img src='./images/grimacestakingclub_mobile.png' width="100%" />
                            </div>
                            <div className='w-full max-w-[768px] font-light text-white text-[18px] md:text-[20px] px-4'>
                                <div className='border-b-2 border-[#F3BA2F]'>
                                    Just stake some tokens to earn high APR, low risk
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-auto bg-[#341461] rounded-md px-4 py-2 flex flex-col items-center gap-1">
                        <div className="text-[15px] text-app-yellow font-light">
                            Total Staked Value ($)
                        </div>
                        <div className="flex gap-1 items-center text-[28px] md:text-[30px] text-white font-bold">
                            {'123,456,789.10'}
                            <span className='text-[24px] mt-1'>USD</span>
                        </div>
                        <div className='w-full my-1'>
                            <Button
                                variant="contained"
                                sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                color="secondary"
                                onClick={() => onRegister()}
                            >
                                <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Apply Pool for your project</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full p-4 md:p-6 flex flex-col lg:flex-row gap-6'>
                <div className="w-full">
                    <PoolsBar isLiveSelected={isLiveSelected} handleSelectShowPools={setIsLiveSelected} />
                    <div className='w-full flex justify-center'>
                        <PaginationKit rowsPerPage={rowsPerPage} count={pageCount} page={page} onSelectRows={(event: SelectChangeEvent) => setRowsPerPage(Number(event.target.value as string))} onSelectPage={onSelectPage} />
                    </div>
                    {isLiveSelected ?
                        <>
                            {isLoadingPools ?
                                <>
                                    {allLivePools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, allLivePools.length) : allLivePools.length).map((_, index: number) => {
                                        return (
                                            <LoadingPoolCard key={index} />
                                        )
                                    })}
                                </> :
                                <>
                                    {pagedLivePools.map((item: IClubMapPoolInfo, index: number) => {
                                        return (
                                            <PoolCard key={index} poolInfo={item} poolIndex={index} onStake={onStake} onUnstake={onUnstake} />
                                        )
                                    })}
                                </>}
                        </>
                        :
                        <>
                            {isLoadingPools ?
                                <>
                                    {pagedExpiredPools.slice(rowsPerPage > 0 ? (page - 1) * rowsPerPage : 0, rowsPerPage > 0 ? Math.min(page * rowsPerPage, pagedExpiredPools.length) : pagedExpiredPools.length).map((_, index: number) => {
                                        return (
                                            <LoadingPoolCard key={index} />
                                        )
                                    })}
                                </> :
                                <>
                                    {pagedExpiredPools.map((item: IClubMapPoolInfo, index: number) => {
                                        return (
                                            <PoolCard key={index} poolInfo={item} poolIndex={index} onStake={onStake} onUnstake={onUnstake} />
                                        )
                                    })}
                                </>}
                        </>
                    }
                </div>
            </div>
        </div>
    )
}