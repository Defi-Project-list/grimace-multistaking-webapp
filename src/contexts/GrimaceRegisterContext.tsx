/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from "@usedapp/core";
import { getContract, calculateGasMargin, isWrappedEther, getChainIdFromName, isToken, BSC_BLOCKTIME } from '@app/utils/utils'
import { TransactionResponse } from '@ethersproject/providers'
import { GrimaceClubAddress, RpcProviders } from "src/constants/AppConstants"
import grimaceFactoryAbi from '@app/constants/contracts/abis/grimaceStakingClub.json'
import { ITokenInfo } from './GrimaceStakingContext';
import useRefresh from '@app/hooks/useRefresh';
import ERC20_ABI from '@app/constants/contracts/abis/erc20.json'
import validator from 'validator'
import { formatEther, parseUnits } from '@ethersproject/units';

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

    payTokenForRegister: ITokenInfo
    payAmountForRegister: BigNumber
    isAllowedRewardToken: boolean
    isAllowedPayToken: boolean
    notNeedCreationFee: boolean

    createdPoolAddress: string

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
    init_registerValues: () => void
    createNewPoolCallback: () => Promise<any>
    setIsAllowedRewardToken: (val: boolean) => void
    setIsAllowedPayToken: (val: boolean) => void
    setCreatedPoolAddress: (val: string) => void
    setStep: (v: number) => void
}

const GrimaceRegisterContext = React.createContext<Maybe<IGrimaceRegisterContext>>(null)
const blockchain = process.env.blockchain

export const GrimaceRegisterProvider = ({ children = null as any }) => {
    const { chainId, account, library } = useEthers()
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
    const [endTime, setEndTime] = useState<BigNumber>(BigNumber.from(0))
    const [stakerLockTime, setStakerLockTime] = useState(BigNumber.from(0))
    const [websiteURL, setWebsiteURL] = useState('')
    const [telegramContact, setTelegramContact] = useState('')

    const { fastRefresh } = useRefresh()
    const [payTokenForRegister, setPayTokenForRegister] = useState<ITokenInfo>()
    const [payAmountForRegister, setPayAmountForRegister] = useState(BigNumber.from(0))
    const [noNeedChargeFeeToken, setNoNeedChargeFeeToken] = useState('')
    const [notNeedCreationFee, setNotNeedCreationFee] = useState(false)

    const [isAllowedRewardToken, setIsAllowedRewardToken] = useState(false)
    const [isAllowedPayToken, setIsAllowedPayToken] = useState(false)

    const [createdPoolAddress, setCreatedPoolAddress] = useState('')

    useEffect(() => {
        try {
            if (!payTokenForRegister) updatePaymentForRegister()
        } catch (e) { }
    }, [fastRefresh])

    useEffect(() => {
        updatePaymentForRegister()
    }, [account, rewardToken])

    useEffect(() => {
        if (stakeToken && rewardToken && noNeedChargeFeeToken) {
            if (isToken(stakeToken.address, noNeedChargeFeeToken) || isToken(rewardToken.address, noNeedChargeFeeToken)) setNotNeedCreationFee(true)
            else setNotNeedCreationFee(false)
        } else {
            setNotNeedCreationFee(false)
        }
    }, [stakeToken, rewardToken, noNeedChargeFeeToken])

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

    const fetchPayToken = async (factoryContract: Contract) => {
        const res = await factoryContract.payToken()
        return res
    }

    const fetchNoNeedChargeFeeToken = async (factoryContract: Contract) => {
        const res = await factoryContract.noNeedChargeFeeToken()
        return res
    }

    const fetchPayAmount = async (factoryContract: Contract) => {
        const res = await factoryContract.payAmount()
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

    const updatePaymentForRegister = async () => {
        const chainId = getChainIdFromName(blockchain);
        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, RpcProviders[chainId], account ? account : undefined)
        try {
            const payaddr = await fetchPayToken(factoryContract)
            const token = await fetchTokenInfo(payaddr)
            setPayTokenForRegister({ ...token, logoURI: '' })

            const payamount = await fetchPayAmount(factoryContract)
            setPayAmountForRegister(payamount)

            const _noNeedChargeFeeToken = await fetchNoNeedChargeFeeToken(factoryContract)
            setNoNeedChargeFeeToken(_noNeedChargeFeeToken)

            if (account) {
                await fetchAllowance(token.address, GrimaceClubAddress).then(async allowance => {
                    if (allowance.gte(payamount.gt(0) ? payamount : parseUnits("1", token.decimals))) setIsAllowedPayToken(true)
                    else setIsAllowedPayToken(false)
                }).catch(error => {
                    console.log(error)
                })
                if (rewardToken) {
                    await fetchAllowance(rewardToken.address, GrimaceClubAddress).then(async allowance => {
                        if (allowance.gte(rewardSupply.gt(0) ? rewardSupply : parseUnits("1", rewardToken.decimals))) setIsAllowedRewardToken(true)
                        else setIsAllowedRewardToken(false)
                    }).catch(error => {
                        console.log(error)
                    })
                }
            }
        } catch (err) { console.log(err) }
    }

    const init_registerValues = () => {
        setStep(1)
        setStakeToken(undefined)
        setRewardToken(undefined)
        setStakeTokenLogo('')
        setRewardTokenLogo('')
        setIsPassableForm1(false)
        setIsPassableForm2(false)
        setIsPassableForm3(false)
        setIsPassableForm4(false)
        setRewardSupply(BigNumber.from(0))
        setRewardPerBlock(BigNumber.from(0))
        setEndTime(BigNumber.from(0))
        setStakerLockTime(BigNumber.from(0))
        setWebsiteURL('')
        setTelegramContact('')
        setPayTokenForRegister(undefined)
        setPayAmountForRegister(BigNumber.from(0))
        setNoNeedChargeFeeToken('')
        setNotNeedCreationFee(false)
        setIsAllowedRewardToken(false)
        setIsAllowedPayToken(false)
        setCreatedPoolAddress('')
    }

    useEffect(() => {
        if (stakeToken && stakeTokenLogo) setIsPassableForm1(true)
        else setIsPassableForm1(false)
    }, [stakeToken, stakeTokenLogo])

    useEffect(() => {
        if (rewardToken && rewardTokenLogo) setIsPassableForm2(true)
        else setIsPassableForm2(false)
    }, [rewardToken, rewardTokenLogo])

    useEffect(() => {
        // if (rewardSupply.gt(rewardPerBlock.mul(stakerLockTime.div(BigNumber.from(BSC_BLOCKTIME))))
        //     && rewardPerBlock.gt(0) && Number(endTime) > ((new Date()).getTime() / 1000)
        //     && stakerLockTime.gt(0) && validator.isURL(websiteURL) && telegramContact.length >= 3) setIsPassableForm3(true)
        // else setIsPassableForm3(false)
        if (rewardSupply.gt(0)
            && rewardPerBlock.gt(0) && Number(endTime) > ((new Date()).getTime() / 1000)
            && stakerLockTime.gt(0) && validator.isURL(websiteURL) && telegramContact.length >= 3) setIsPassableForm3(true)
        else setIsPassableForm3(false)
    }, [rewardSupply, rewardPerBlock, endTime, stakerLockTime, websiteURL, telegramContact])

    useEffect(() => {
        if ((isAllowedPayToken && isAllowedRewardToken) || (notNeedCreationFee && isAllowedRewardToken)) setIsPassableForm4(true)
        else setIsPassableForm4(false)
    }, [isAllowedPayToken, isAllowedRewardToken])

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

    const createNewPoolCallback = async function () {
        if (!account || !library || !GrimaceClubAddress) return

        const factoryContract: Contract = getContract(GrimaceClubAddress, grimaceFactoryAbi, library, account ? account : undefined)
        let bnbAmount: BigNumber = BigNumber.from(0)
        if (isWrappedEther(blockchain, rewardToken.address)) {
            bnbAmount = bnbAmount.add(rewardSupply)
        }
        if (isWrappedEther(blockchain, payTokenForRegister.address)) {
            bnbAmount = bnbAmount.add(payAmountForRegister)
        }
        let params = {
            stakingToken: stakeToken.address,
            rewardToken: rewardToken.address,
            stakingTokenLogo: stakeTokenLogo,
            rewardTokenLogo: rewardTokenLogo,
            websiteURL: websiteURL,            
            rewardSupply: rewardSupply,
            payAmount: payAmountForRegister,
            lockDuration: stakerLockTime,            
            rewardPerBlock: rewardPerBlock,
            endTime: endTime
        }
        return factoryContract.estimateGas.createNewPool(params, { value: bnbAmount }).then(estimatedGasLimit => {
            const gas = estimatedGasLimit
            return factoryContract.createNewPool(params, {
                value: bnbAmount, gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
                return response.wait().then((res: any) => {
                    return { status: res.status, events: res.events.pop() }
                })
            })
        })
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

                payTokenForRegister,
                payAmountForRegister,
                isAllowedRewardToken,
                isAllowedPayToken,
                notNeedCreationFee,

                createdPoolAddress,

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
                init_registerValues,
                createNewPoolCallback,
                setIsAllowedRewardToken,
                setIsAllowedPayToken,
                setCreatedPoolAddress,
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
