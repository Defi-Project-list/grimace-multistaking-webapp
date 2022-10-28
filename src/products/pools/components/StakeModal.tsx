import React, { useMemo, useState, useEffect, useRef } from 'react'
import Modal from 'src/common/components/Modal'
import { formatUnits, isAddress, parseEther, parseUnits } from 'ethers/lib/utils'
import { Contract } from '@ethersproject/contracts'
import ERC20_ABI from 'src/constants/contracts/abis/erc20.json'
import { CHAIN_ID_NAME_MAP, RpcProviders } from '@app/constants/AppConstants'
import { useEthers } from "@usedapp/core"
import { BUY_BASE_URL, decodeTxErrorMessage, formatEther, formatEther_Optimized, formatFixedNumber_Optimized, getContract, getEtherscanLink, isToken, unknownToken_Icon } from '@app/utils/utils'
import TokenQuantityInput from './TokenQuantityInput'
import { BigNumber } from '@ethersproject/bignumber'
import { Button, Slider } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import { IClubMapPoolInfo, IPoolAndUserInfo, useGrimaceStakingClub } from '@app/contexts'
import { toast } from 'react-toastify'

interface ModalProps {
    isOpen: boolean
    poolInfo: IClubMapPoolInfo
    handleClose: () => void
}

const ID_STAKE_TOKEN_INPUT = 'id_modal_stake_token_input'

export default function StakeModal({ isOpen, poolInfo, handleClose }: ModalProps) {
    const { library, account, chainId } = useEthers()
    const [isLoading, setIsLoading] = useState(false)
    const [hash, setHash] = useState('')
    const [amount, setInputAmount] = useState(BigNumber.from(0))
    const [percent, setPercent] = useState<number | string | Array<number | string>>(0)
    const {
        bnbBalance,
        pagedLivePools,
        stakeCallback,
        updateChangedPoolAndUserInfo,
        updateTotalStakedValue
    } = useGrimaceStakingClub()

    const init = () => {
        setIsLoading(false)
        setHash('')
        setInputAmount(BigNumber.from(0))
        initInputBox()
    }

    useEffect(() => {
        init()
    }, [account, isOpen])

    const getValueUSDFromAmount = (amount: BigNumber, price: number, decimals: number) => {
        return Number(formatUnits(amount.mul(parseEther(price.toFixed(18))).div(parseEther('1')), decimals))
    }

    const onClose = () => {
        if (!isLoading) handleClose()
    }

    const onInputChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), poolInfo.poolAndUserInfo.stakingToken.decimals)
            else amount = parseUnits(val, poolInfo.poolAndUserInfo.stakingToken.decimals)
        }
        setInputAmount(amount)
        if (poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0)) {
            setPercent(0)
        } else {
            let p = amount.mul(BigNumber.from(10000)).div(poolInfo.poolAndUserInfo.userStakeTokenBalance)
            let _percent = p.gt(BigNumber.from(10000)) ? 100 : Number(p) / 100
            setPercent(_percent)
        }
    }

    const setInputBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_STAKE_TOKEN_INPUT)
        if (element) element.value = formatUnits(val, poolInfo.poolAndUserInfo.stakingToken.decimals)
    }

    const initInputBox = () => {
        setInputAmount(BigNumber.from(0))
        let element: any = document.getElementById(ID_STAKE_TOKEN_INPUT)
        if (element) element.value = ""
    }

    const onStake = async () => {
        setIsLoading(true)
        try {
            await stakeCallback(amount, poolInfo.poolAddress, poolInfo.poolAndUserInfo.stakingToken.address).then((res: any) => {
                if (res.status === 1) {
                    setIsLoading(false)
                    let poolIndex = 0
                    setHash(res.hash)
                    for (let i = 0; i < pagedLivePools.length; i++) {
                        if (isToken(pagedLivePools[i].poolAddress, poolInfo.poolAddress)) {
                            poolIndex = i
                            break;
                        }
                    }
                    updateChangedPoolAndUserInfo(poolIndex)
                    updateTotalStakedValue()                    
                    toast.success('Successfully staked!')
                } else {
                    toast.error(`Transaction reverted! Tx:${res.hash}`)
                }
            }).catch((error: any) => {
                console.log(error)
                setIsLoading(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }
        initInputBox()
        setInputAmount(BigNumber.from(0))
        return null
    }

    const onSetAmountByPercent = (val: number) => {
        setPercent(val)
        setAmountBySliderBar(Number(val))
    }

    const setAmountBySliderBar = (val: number) => {
        let _percent = (Math.floor(val * 100)) ?? 0
        let _amount = poolInfo.poolAndUserInfo.userStakeTokenBalance.mul(BigNumber.from(_percent)).div(BigNumber.from(10000))
        setInputAmount(_amount)
        setInputBoxValue(_amount)
    }
    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setPercent(newValue);
        setAmountBySliderBar(Number(newValue))
    };

    return (
        <div className='w-full'>
            <Modal
                isOpen={isOpen}
                handleClose={onClose}
                bgColor={'#7A30E0'}
            >
                <div className='w-full p-4'>
                    <div className="w-full flex flex-row justify-between items-center border-b-2 border-[#987DF9]">
                        <div className='w-full text-[14px] md:text-[15px] text-[#EFEFEF]'>
                            Stake in pool
                        </div>
                        <div className="w-full flex justify-end">
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-black-400 hover:text-gray-500 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                onClick={handleClose}>
                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M15 2.72727C8.22196 2.72727 2.72727 8.22196 2.72727 15C2.72727 21.778 8.22196 27.2727 15 27.2727C21.778 27.2727 27.2727 21.778 27.2727 15C27.2727 8.22196 21.778 2.72727 15 2.72727ZM0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#EFEFEF" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M20.957 9.04006C21.5846 9.66769 21.5846 10.6853 20.957 11.3129L11.3141 20.9558C10.6865 21.5834 9.66891 21.5834 9.04128 20.9558C8.41365 20.3281 8.41365 19.3105 9.04128 18.6829L18.6841 9.04006C19.3118 8.41243 20.3294 8.41243 20.957 9.04006Z" fill="#EFEFEF" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.04128 9.04006C9.66891 8.41243 10.6865 8.41243 11.3141 9.04006L20.957 18.6829C21.5846 19.3105 21.5846 20.3281 20.957 20.9558C20.3294 21.5834 19.3118 21.5834 18.6841 20.9558L9.04128 11.3129C8.41365 10.6853 8.41365 9.66769 9.04128 9.04006Z" fill="#EFEFEF" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className='w-full mt-4'>
                        {!isLoading && !hash && (
                            <div className='w-full'>
                                <div className='w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center'>
                                    <div className='w-[120px] sm:w-[70px]'>
                                        <img src="./images/Logomark_GrimaceCoin.png" width="100%" />
                                    </div>
                                    <div className='w-full text-white flex flex-col items-center sm:items-end'>
                                        <div className='text-[22px] sm:text-[25px] font-semibold'>
                                            {`Stake ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}
                                        </div>
                                        <div className='text-[13px] sm:text-[15px] font-light'>
                                            {`Balance: ${formatEther_Optimized(poolInfo.poolAndUserInfo.userStakeTokenBalance, poolInfo.poolAndUserInfo.stakingToken.decimals, 3, false)}`}
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full mt-6'>
                                    <TokenQuantityInput id={ID_STAKE_TOKEN_INPUT} onChange={onInputChange} />
                                    <div className='w-full flex justify-end'>
                                        <div className='text-white text-[13px] sm:text-[15px] font-light'>
                                            {`≈${formatFixedNumber_Optimized(getValueUSDFromAmount(amount, poolInfo.poolAndUserInfo.stakingTokenPrice, poolInfo.poolAndUserInfo.stakingToken.decimals), 3, false)} USD`}
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full text-white flex flex-col items-center sm:items-end my-2'>
                                    <div className='text-[13px] sm:text-[15px] font-light'>
                                        {`BNB Balance: ${formatEther_Optimized(bnbBalance, 18, 3, false)}`}
                                    </div>
                                </div>                                
                                <div className="w-full flex flex-col gap-2 mt-4">
                                    <Slider
                                        size="small"
                                        value={typeof percent === 'number' ? percent : 0}
                                        aria-label="Small"
                                        // valueLabelDisplay="auto"
                                        color="secondary"
                                        onChange={handleSliderChange}
                                        min={0}
                                        max={100}
                                        disabled={poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || !account || poolInfo.poolAndUserInfo.userStakeTokenBalance.lt(amount)}
                                    />
                                    <div className='w-full px-4 flex gap-2'>
                                        <div className='basis-1/4'>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "100%", height: '40px' }}
                                                color="secondary"
                                                onClick={() => onSetAmountByPercent(25)}
                                                disabled={poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || !account}
                                            >
                                                <span className='text-[18px] sm:text-[20px] font-bold'>25%</span>
                                            </Button>
                                        </div>
                                        <div className='basis-1/4'>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "100%", height: '40px' }}
                                                color="secondary"
                                                onClick={() => onSetAmountByPercent(50)}
                                                disabled={poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || !account}
                                            >
                                                <span className='text-[18px] sm:text-[20px] font-bold'>50%</span>
                                            </Button>
                                        </div>
                                        <div className='basis-1/4'>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "100%", height: '40px' }}
                                                color="secondary"
                                                onClick={() => onSetAmountByPercent(75)}
                                                disabled={poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || !account}
                                            >
                                                <span className='text-[18px] sm:text-[20px] font-bold'>75%</span>
                                            </Button>
                                        </div>
                                        <div className='basis-1/4'>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "100%", height: '40px' }}
                                                color="secondary"
                                                onClick={() => onSetAmountByPercent(100)}
                                                disabled={poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || !account}
                                            >
                                                <span className='text-[18px] sm:text-[20px] font-bold'>MAX</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {(poolInfo.poolAndUserInfo.userStakeTokenBalance.lte(0) || amount.gt(poolInfo.poolAndUserInfo.userStakeTokenBalance)) &&
                                    <div className='w-full rounded-md bg-app-box mt-6 py-1 px-2 flex gap-2'>
                                        <div className='mt-[2px]'>
                                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9 1.63636C4.93318 1.63636 1.63636 4.93318 1.63636 9C1.63636 13.0668 4.93318 16.3636 9 16.3636C13.0668 16.3636 16.3636 13.0668 16.3636 9C16.3636 4.93318 13.0668 1.63636 9 1.63636ZM0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9Z" fill="#7A30E0" />
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.99994 4.90918C9.45181 4.90918 9.81813 5.27549 9.81813 5.72736V9.00009C9.81813 9.45196 9.45181 9.81827 8.99994 9.81827C8.54808 9.81827 8.18176 9.45196 8.18176 9.00009V5.72736C8.18176 5.27549 8.54808 4.90918 8.99994 4.90918Z" fill="#7A30E0" />
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.18176 12.2725C8.18176 11.8207 8.54808 11.4543 8.99994 11.4543H9.00813C9.46 11.4543 9.82631 11.8207 9.82631 12.2725C9.82631 12.7244 9.46 13.0907 9.00813 13.0907H8.99994C8.54808 13.0907 8.18176 12.7244 8.18176 12.2725Z" fill="#7A30E0" />
                                            </svg>
                                        </div>
                                        <div className="text-[15px] text-app-primary font-semibold">
                                            Insufficient balance
                                        </div>
                                    </div>
                                }
                                <div className='w-full flex items-center gap-5 mt-8'>
                                    <div className='basis-1/2'>
                                        <Button
                                            variant="contained"
                                            sx={{ width: "100%", height: '40px' }}
                                            color="primary"
                                            target="_SEJ"
                                            rel="noreferrer"
                                            href={BUY_BASE_URL + poolInfo.poolAndUserInfo.stakingToken.address}
                                        >
                                            <span className='text-[20px] font-bold'>Buy TKN</span>
                                        </Button>
                                    </div>
                                    <div className='basis-1/2'>
                                        <Button
                                            variant="contained"
                                            sx={{ width: "100%", height: '40px' }}
                                            color="secondary"
                                            onClick={onStake}
                                            disabled={amount.lte(0) || amount.gt(poolInfo.poolAndUserInfo.userStakeTokenBalance) || !account}
                                        >
                                            <span className='text-[20px] font-bold'>Stake</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>)}
                        {isLoading && !hash && (
                            <div className="w-full flex justify-center items-center flex-col gap-4">
                                <div className='w-full' style={{ visibility: 'hidden' }}>
                                    <input
                                        className="w-full min-w-[80px] p-4 h-[20px]"
                                    />
                                </div>
                                <Fade in={true} style={{ transitionDelay: '800ms' }} unmountOnExit>
                                    <CircularProgress size='5rem' sx={{ color: '#FFFFFF' }} />
                                </Fade>
                                <div className='w-full' style={{ marginTop: '40px', marginBottom: '90px' }}>
                                    <div className='w-full text-center text-white text-[28px] text-app-yellow font-bold'>
                                        Staking
                                    </div>
                                    <div className='w-full text-center text-white text-[20px] mt-4 font-semibold'>
                                        {`${formatUnits(amount, poolInfo.poolAndUserInfo.stakingToken.decimals)} ${poolInfo.poolAndUserInfo.stakingToken.symbol}`}
                                    </div>
                                </div>
                            </div>
                        )}
                        {hash && (
                            <div className='w-full'>
                                <div className='w-full' style={{ visibility: 'hidden' }}>
                                    <input
                                        className="w-full min-w-[80px] p-4 h-[20px]"
                                    />
                                </div>
                                <div className='w-full flex justify-center py-4'>
                                    <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 44L35 73L102 6" stroke="#56FF55" strokeWidth="15" />
                                    </svg>
                                    {/* <svg width="60" height="60" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.9975 2.39488C8.7888 1.85631 7.43839 1.72289 6.14766 2.01451C4.85694 2.30613 3.69506 3.00717 2.83531 4.01308C1.97556 5.01898 1.464 6.27586 1.37694 7.59625C1.28987 8.91664 1.63196 10.2298 2.35218 11.3399C3.0724 12.45 4.13217 13.2975 5.37342 13.7561C6.61468 14.2147 7.97092 14.2597 9.23988 13.8845C10.5088 13.5093 11.6225 12.734 12.4148 11.6742C13.2071 10.6143 13.6356 9.32677 13.6364 8.00351V7.37663C13.6364 7.00007 13.9416 6.69481 14.3182 6.69481C14.6947 6.69481 15 7.00007 15 7.37663V8.0039C14.9991 9.62122 14.4754 11.1953 13.507 12.4907C12.5386 13.786 11.1775 14.7336 9.62652 15.1922C8.07557 15.6508 6.41794 15.5957 4.90085 15.0352C3.38376 14.4747 2.08849 13.4389 1.20822 12.0821C0.32795 10.7253 -0.0901566 9.12034 0.0162576 7.50653C0.122672 5.89271 0.747905 4.35654 1.79871 3.1271C2.84951 1.89766 4.26959 1.04083 5.84714 0.684402C7.42469 0.327975 9.0752 0.491046 10.5525 1.14929C10.8965 1.30255 11.0511 1.70563 10.8978 2.04958C10.7445 2.39354 10.3415 2.54814 9.9975 2.39488Z" fill="#0ABA06" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M14.8003 2.06652C15.0667 2.33266 15.0669 2.76436 14.8008 3.03076L7.98258 9.85576C7.85474 9.98373 7.68128 10.0557 7.50039 10.0557C7.3195 10.0557 7.14601 9.98391 7.0181 9.856L4.97265 7.81055C4.70638 7.54428 4.70638 7.11258 4.97265 6.84631C5.23892 6.58004 5.67062 6.58004 5.93689 6.84631L7.49998 8.40941L13.836 2.06701C14.1022 1.80061 14.5339 1.80039 14.8003 2.06652Z" fill="#0ABA06" />
                                    </svg> */}
                                </div>
                                <div className='flex flex-col gap-2' style={{ marginTop: '20px', marginBottom: '50px' }}>
                                    <div className='text-[28px] text-[#56FF55] text-center uppercase font-bold'>Success!</div>
                                    <div className='text-[20px] text-white text-center uppercase'>Tx hash</div>
                                    <div className='text-[14px] text-white text-center underline'>{hash.slice(0, 10) + '...' + hash.slice(56, 65)}</div>
                                    {chainId && (
                                        <a className='text-[16px] mt-4 text-white underline text-center' target="_SEJ" rel="noreferrer" href={getEtherscanLink(chainId, hash, 'transaction')}>
                                            {chainId && `View on ${CHAIN_ID_NAME_MAP[97]}`}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
