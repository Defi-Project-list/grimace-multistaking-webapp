import React, { useMemo, useState, useEffect } from 'react'
import { Button } from "@mui/material"
import { useTokenBalance, useEthers } from "@usedapp/core"
import localforage from "localforage"
import { AppTokenAddress } from '@app/constants/AppConstants'
import { Web3ModalButton } from "./WalletConnect/Web3Modal"
import { formatEther } from '@app/utils/utils'
import { useRouter } from "next/router"
import { parseUnits } from '@ethersproject/units'
import { SidebarItem, SIDEBAR_ROUTES } from './layout/LayoutConstants'

function BalanceAmount() {
    const { account } = useEthers()
    const userBalance = useTokenBalance(AppTokenAddress, account)
    const formattedBalance = (!!userBalance) ? formatEther(userBalance, 18, 3, false) : '0.00'

    return (
        <>
            {/* <div className="flex justify-center text-[10px] md:text-xs text-center">{formattedBalance} WOLF</div> */}
            <div className="flex justify-center text-[10px] md:text-xs text-center">{account}</div>
        </>
    )
}

function BalanceAndDisconnect({ isMobile }: { isMobile: boolean }) {
    const { deactivate, connector } = useEthers()
    const router = useRouter()
    const routeMatch = (path: string) => {
        return router.pathname === path
    }

    const handleDisconnect = async () => {
        await localforage.setItem("connectionStatus", false)
        deactivate()
        if (connector) {
            (connector as any)?.deactivate()
        }
    }

    return (
        <>

            <div className="w-full flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="flex flex-col text-gray-400 w-full md:min-w-[170px] border border-[#112b40] p-1 rounded-md">
                    <div className="flex justify-center text-xs text-center">Available Balance</div>
                    <BalanceAmount />
                </div>
                <div className="w-full">
                    <Button
                        variant="outlined"
                        onClick={handleDisconnect}
                        sx={{ borderRadius: "12px", borderColor: "#4BCEE8", width: isMobile ? '100%' : '130px', height: '40px' }}
                        className="relative">
                        <span className="text-[14px] md:text-[16px] text-white">Disconnect</span>
                    </Button>
                </div>
            </div>
        </>
    )
}

export default function Wallet({ isMobile }: { isMobile: boolean }) {
    const { account } = useEthers()
    const activateProvider = Web3ModalButton()
    const isConnected = !!account

    return (
        <div className="flex justify-center">
            {!isConnected && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={activateProvider}
                    sx={{ borderRadius: "12px", borderColor: "#4BCEE8", width: isMobile ? '100%' : '180px', height: '40px' }}
                >
                    <span className="text-[14px] md:text-[16px] text-white">Connect</span>
                </Button>
            )}
            {isConnected && <BalanceAndDisconnect isMobile={isMobile} />}
        </div>
    )
}