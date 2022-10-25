import React, { useMemo, useState, useEffect } from 'react'
import { Button } from "@mui/material"
import { useTokenBalance, useEthers } from "@usedapp/core"
import localforage from "localforage"
import { AppTokenAddress } from '@app/constants/AppConstants'
import { Web3ModalButton } from "./WalletConnect/Web3Modal"
import { formatEther, shortenAddress } from '@app/utils/utils'
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

function AccountAndDisconnect() {
    const { account, deactivate, connector } = useEthers()
    const router = useRouter()

    const handleDisconnect = async () => {
        await localforage.setItem("connectionStatus", false)
        deactivate()
        if (connector) {
            (connector as any)?.deactivate()
        }
    }

    return (
        <>

            <div className="w-full flex gap-2 items-center cursor-pointer" onClick={handleDisconnect}>
                <img src='./images/wallet.png' width={'30px'} />
                <span className="text-white text-[18px] md:text-[20px]">
                    {shortenAddress(account, 4)}
                </span>
            </div>
        </>
    )
}

export default function Wallet() {
    const { account } = useEthers()
    const activateProvider = Web3ModalButton()
    const isConnected = !!account

    return (
        <div className="flex justify-center">
            {!isConnected && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={activateProvider}
                    sx={{ borderRadius: "12px", fontFamily: 'Inter', width: '180px', height: '36px' }}
                >
                    <span className="text-[16px] md:text-[18px] text-app-primary">Connect</span>
                </Button>
            )}
            {isConnected && <AccountAndDisconnect />}
        </div>
    )
}