import React, { useMemo, useState, useEffect, useRef } from 'react'
import Modal from 'src/common/components/Modal'
import { formatUnits, isAddress, parseUnits } from 'ethers/lib/utils'
import { Contract } from '@ethersproject/contracts'
import ERC20_ABI from 'src/constants/contracts/abis/erc20.json'
import { CHAIN_ID_NAME_MAP, RpcProviders } from '@app/constants/AppConstants'
import { useEthers } from "@usedapp/core"
import { decodeTxErrorMessage, formatEther, getContract, getEtherscanLink, isToken, unknownToken_Icon } from '@app/utils/utils'
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
const BUY_BASE_URL = 'https://pancakeswap.finance/swap?outputCurrency='

export default function StakeModal({ isOpen, poolInfo, handleClose }: ModalProps) {
    const { library, account, chainId } = useEthers()
    const [isLoading, setIsLoading] = useState(false)
    const [hash, setHash] = useState('')
    const [amount, setInputAmount] = useState(BigNumber.from(0))
    const [percent, setPercent] = useState<number | string | Array<number | string>>(0)
    const [item, setItem] = useState<IPoolAndUserInfo>()
    const {
        bnbBalance,
        pagedLivePools,
        stakeCallback,
        updateChangedPoolAndUserInfo
    } = useGrimaceStakingClub()

    useEffect(() => {
        setItem(poolInfo.poolAndUserInfo)
    }, [poolInfo])

    const onClose = () => {
        if (!isLoading) handleClose()
    }

    const onInputChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), item.stakingToken.decimals)
            else amount = parseUnits(val, item.stakingToken.decimals)
        }
        setInputAmount(amount)
        if (item.userStakeTokenBalance.lte(0)) {
            setPercent(0)
        } else {
            let p = amount.mul(BigNumber.from(10000)).div(item.userStakeTokenBalance)
            let _percent = p.gt(BigNumber.from(10000)) ? 100 : Number(p) / 100
            setPercent(_percent)
        }
    }

    const setInputBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_STAKE_TOKEN_INPUT)
        if (element) element.value = formatUnits(val, item.stakingToken.decimals)
    }

    const initInputBox = () => {
        setInputAmount(BigNumber.from(0))
        let element: any = document.getElementById(ID_STAKE_TOKEN_INPUT)
        if (element) element.value = ""
    }

    const onStake = async () => {
        setIsLoading(true)
        try {
            await stakeCallback(amount, poolInfo.poolAddress, item.stakingToken.address).then((res: any) => {
                if (res.status === 1) {
                    setIsLoading(false)
                    let poolIndex = 0
                    for (let i=0;i<pagedLivePools.length;i++) {
                        if (isToken(pagedLivePools[i].poolAddress, poolInfo.poolAddress)){
                            poolIndex = i
                            break;
                        }
                    }
                    updateChangedPoolAndUserInfo(poolIndex)
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
        return null
    }

    const onSetAmountByPercent = (val: number) => {
        setPercent(val)
        setAmountBySliderBar(Number(val))
    }

    const setAmountBySliderBar = (val: number) => {
        let _percent = (Math.floor(val * 100)) ?? 0
        let _amount = item.userStakeTokenBalance.mul(BigNumber.from(_percent)).div(BigNumber.from(10000))
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
                                        <div className='text-[22px] sm:text-[25px] font-semibold'>Stake TKN</div>
                                        <div className='text-[13px] sm:text-[15px] font-light'>Balance: 123456789123456789123456789</div>
                                    </div>
                                </div>
                                <div className='w-full mt-6'>
                                    <TokenQuantityInput id={ID_STAKE_TOKEN_INPUT} onChange={onInputChange} />
                                    <div className='w-full flex justify-end'>
                                        <div className='text-white text-[13px] sm:text-[15px] font-light'>
                                            ≈15645464 USD
                                        </div>
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
                                        disabled={item.userStakeTokenBalance.lte(0) || !account || item.userStakeTokenBalance.lt(amount)}
                                    />
                                    <div className='w-full px-4 flex gap-2'>
                                        <div className='basis-1/4'>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "100%", height: '40px' }}
                                                color="secondary"
                                                onClick={() => onSetAmountByPercent(25)}
                                                disabled={item.userStakeTokenBalance.lte(0) || !account}
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
                                                disabled={item.userStakeTokenBalance.lte(0) || !account}
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
                                                disabled={item.userStakeTokenBalance.lte(0) || !account}
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
                                                disabled={item.userStakeTokenBalance.lte(0) || !account}
                                            >
                                                <span className='text-[18px] sm:text-[20px] font-bold'>MAX</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex items-center gap-5 mt-8'>
                                    <div className='basis-1/2'>
                                        <Button
                                            variant="contained"
                                            sx={{ width: "100%", height: '40px' }}
                                            color="primary"
                                            target="_SEJ"
                                            rel="noreferrer"
                                            href={BUY_BASE_URL}
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
                                            disabled={amount.lte(0) || amount.gt(item.userStakeTokenBalance) || !account}
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
                                    <CircularProgress size='5rem' />
                                </Fade>
                                <div className='w-full' style={{ marginTop: '40px', marginBottom: '40px' }}>
                                    <div className='w-full text-center text-white text-[20px] uppercase'>
                                        Depositing
                                    </div>
                                    <div className='w-full text-center text-app-green text-[20px]'>
                                        {`${formatEther(amount, 18, 3, true)} STFU`}
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
                                        <path d="M6 44L35 73L102 6" stroke="#7F41E4" strokeWidth="15" />
                                    </svg>
                                </div>
                                <div className='flex flex-col gap-2' style={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <div className='text-[20px] text-white text-center uppercase'>Successful</div>
                                    <div className='text-[14px] text-white text-center uppercase'>Tx hash</div>
                                    <div className='text-[12px] text-white text-center'>{hash.slice(0, 10) + '...' + hash.slice(56, 65)}</div>
                                    {chainId && (
                                        <a className='text-[14px] mt-4 text-app-purple underline text-center' target="_SEJ" rel="noreferrer" href={getEtherscanLink(chainId, hash, 'transaction')}>
                                            {chainId && `View on ${CHAIN_ID_NAME_MAP[chainId]}`}
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
