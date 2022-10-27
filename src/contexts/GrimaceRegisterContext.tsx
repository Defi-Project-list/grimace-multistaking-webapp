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
import { ITokenInfo } from './GrimaceStakingContext';

declare type Maybe<T> = T | null | undefined

export interface IGrimaceRegisterContext {
    isPassableForm1: boolean
    isPassableForm2: boolean
    isPassableForm3: boolean
    isPassableForm4: boolean
    stakeToken: ITokenInfo
    rewardToken: ITokenInfo
    stakeTokenLogo: string
    rewardTokenLogo: string
    step: number
    rewardSupply: BigNumber
    rewardPerBlock: BigNumber
    endTime: BigNumber
    stakerLockTime: BigNumber
    websiteURL: string
    telegramContact: string

    onChangeStakeToken: (token: ITokenInfo) => void
    onChangeStakeLogo: (val: string) => void
    onChangeRewardToken: (token: ITokenInfo) => void
    onChangeRewardLogo: (val: string) => void
    setStakeToken: (v: ITokenInfo) => void
    setRewardToken: (v: ITokenInfo) => void
    setRewardSupply: (val: BigNumber) => void
    setRewardPerBlock: (val: BigNumber) => void
    setEndTime: (val: BigNumber) => void
    setStakerLockTime: (val: BigNumber) => void
    setWebsiteURL: (val: string) => void
    setTelegramContact: (val: string) => void
    setStep: (v: number) => void
}

const GrimaceRegisterContext = React.createContext<Maybe<IGrimaceRegisterContext>>(null)
const blockchain = process.env.blockchain

export const GrimaceRegisterProvider = ({ children = null as any }) => {
    const [step, setStep] = useState(1)
    const [stakeToken, setStakeToken] = useState<ITokenInfo>()
    const [rewardToken, setRewardToken] = useState<ITokenInfo>()
    const [stakeTokenLogo, setStakeTokenLogo] = useState('')
    const [rewardTokenLogo, setRewardTokenLogo] = useState('')
    const [isPassableForm1, setIsPassableForm1] = useState(false)
    const [isPassableForm2, setIsPassableForm2] = useState(false)
    const [isPassableForm3, setIsPassableForm3] = useState(false)
    const [isPassableForm4, setIsPassableForm4] = useState(false)
    const [rewardSupply, setRewardSupply] = useState(BigNumber.from(0))
    const [rewardPerBlock, setRewardPerBlock] = useState(BigNumber.from(0))
    const [endTime, setEndTime] = useState<BigNumber>()
    const [stakerLockTime, setStakerLockTime] = useState(BigNumber.from(0))
    const [websiteURL, setWebsiteURL] = useState('')
    const [telegramContact, setTelegramContact] = useState('')

    useEffect(() => {
        if (stakeToken && stakeTokenLogo) setIsPassableForm1(true)
        else setIsPassableForm1(false)
    }, [stakeToken, stakeTokenLogo])

    useEffect(() => {
        if (rewardToken && rewardTokenLogo) setIsPassableForm2(true)
        else setIsPassableForm2(false)
    }, [rewardToken, rewardTokenLogo])

    const onChangeStakeToken = (token: ITokenInfo) => {
        setStakeToken(token)
    }

    const onChangeStakeLogo = (val: string) => {
        setStakeTokenLogo(val)
    }

    const onChangeRewardToken = (token: ITokenInfo) => {
        setRewardToken(token)
    }

    const onChangeRewardLogo = (val: string) => {
        setRewardTokenLogo(val)
    }

    return (
        <GrimaceRegisterContext.Provider
            value={{
                isPassableForm1,
                isPassableForm2,
                isPassableForm3,
                isPassableForm4,
                stakeToken,
                rewardToken,
                stakeTokenLogo,
                rewardTokenLogo,
                step,
                rewardSupply,
                rewardPerBlock,
                endTime,
                stakerLockTime,
                websiteURL,
                telegramContact,

                onChangeStakeToken,
                onChangeStakeLogo,
                onChangeRewardToken,
                onChangeRewardLogo,
                setStakeToken,
                setRewardToken,
                setRewardSupply,
                setRewardPerBlock,
                setEndTime,
                setStakerLockTime,
                setWebsiteURL,
                setTelegramContact,
                setStep
            }}
        >
            {children}
        </GrimaceRegisterContext.Provider >
    )
}

export const useGrimaceRegister = () => {
    const context = useContext(GrimaceRegisterContext)

    if (!context) {
        throw new Error('Component rendered outside the provider tree')
    }

    return context
}
