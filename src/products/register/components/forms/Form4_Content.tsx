import AmountInputBox from "@app/common/components/AmountInputBox"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { Button } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import SuccessSVG from "./SuccessSVG"
import { useGrimaceRegister } from "@app/contexts"
import { decodeTxErrorMessage, getShortDateTimeWithoutSeconds, ONEDAY_SECS } from "@app/utils/utils"
import InfoSVG from "./InfoSVG"
import { useApproveCallback } from "@app/hooks/hooks"
import { toast } from "react-toastify"
import { GrimaceClubAddress } from "@app/constants/AppConstants"
import { LoadingButton } from "@mui/lab"

const blockchain = process.env.blockchain

interface props {

}

export default function Form4_Content() {
    const {
        stakeToken,
        stakeTokenLogo,
        rewardToken,
        rewardTokenLogo,
        notNeedCreationFee,
        payTokenForRegister,
        isAllowedPayToken,
        isAllowedRewardToken,
        payAmountForRegister,
        rewardSupply,
        rewardPerBlock,
        endTime,
        stakerLockTime,
        websiteURL,
        telegramContact,
        isPassableForm4,
        setIsAllowedRewardToken,
        setIsAllowedPayToken,
        setCreatedPoolAddress,
        createNewPoolCallback,
        setStep
    } = useGrimaceRegister()
    const { approveCallback } = useApproveCallback()
    const [isPayTokenApproving, setIsPayTokenApproving] = useState(false)
    const [isRewardTokenApproving, setIsRewardTokenApproving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const onApprovePayToken = async () => {
        setIsPayTokenApproving(true)
        try {
            await approveCallback(GrimaceClubAddress, payTokenForRegister.address, blockchain).then((hash: string) => {
                setIsPayTokenApproving(false)
                setIsAllowedPayToken(true)
                toast.success('Approved!')
            }).catch((error: any) => {
                console.log(error)
                setIsPayTokenApproving(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsPayTokenApproving(false)
        }
        return null;
    }

    const onApproveRewardToken = async () => {
        setIsRewardTokenApproving(true)
        try {
            await approveCallback(GrimaceClubAddress, rewardToken.address, blockchain).then((hash: string) => {
                setIsRewardTokenApproving(false)
                setIsAllowedRewardToken(true)
                toast.success('Approved!')
            }).catch((error: any) => {
                console.log(error)
                setIsRewardTokenApproving(false)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            console.log(error)
            setIsRewardTokenApproving(false)
        }
        return null
    }

    const onCreatePool = async () => {
        setIsLoading(true)
        try {
            createNewPoolCallback().then((res: any) => {
                if (res.status) {
                    setCreatedPoolAddress(res.events.args.poolAddress)
                    toast.success("Successfully created!")
                    setStep(5)
                } else {
                    toast.error("Transaction reverted!")
                }
                setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
                console.log(error)
                let err: any = error
                toast.error(decodeTxErrorMessage(err))
            })
        } catch (error) {
            setIsLoading(false)
            console.log(error)
        }
        return null
    }

    return (
        <div className="w-full">
            <div className="w-full flex flex-col md:flex-row gap-4">
                <div className='md:basis-1/2 w-full bg-white rounded-md p-4 flex gap-4 items-center' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className="w-[48px] xl:w-[56px]">
                        <img src={stakeTokenLogo} width="100%" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[22px] md:text-[25px] text-app-purple font-bold">
                            {`Stake ${stakeToken.name}`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            {`${stakeToken.symbol} | ${stakeToken.decimals} Decimal`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            {`CA: ${stakeToken.address}`}
                        </div>
                    </div>
                </div>
                <div className='md:basis-1/2 w-full bg-white rounded-md p-4 flex gap-4 items-center' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className="w-[48px] xl:w-[56px]">
                        <img src={rewardTokenLogo} width="100%" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[22px] md:text-[25px] text-app-purple font-bold">
                            {`Reward ${rewardToken.name}`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            {`${rewardToken.symbol} | ${rewardToken.decimals} Decimal`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            {`CA: ${rewardToken.address}`}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col gap-4 mt-6">
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Total Reward Supply</div>
                        <div className="text-[22px] md:text-[25px] text-app-primary font-bold break-all">{`${formatUnits(rewardSupply, rewardToken.decimals)} ${rewardToken.symbol}`}</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Pool Removable Date</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font- break-all">{getShortDateTimeWithoutSeconds(new Date(Number(endTime) * 1000))}</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Staker Timelock</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">{`${Number(stakerLockTime) / ONEDAY_SECS} Days`}</div>
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Reward per Block</div>
                        <div className="text-[22px] md:text-[25px] text-app-primary font-bold break-all">{`${formatUnits(rewardPerBlock, rewardToken.decimals)} ${rewardToken.symbol}`}</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Website URL</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">{websiteURL}</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Telegram Contanct</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">{telegramContact}</div>
                    </div>
                </div>
            </div>
            <div className="w-full border-b-2 border-[#7A30E0] mt-6" />
            <div className="w-full text-[18px] text-[20px] text-app-primary mt-6">
                You will need to pay <span className="font-bold">{`${formatUnits(payAmountForRegister, payTokenForRegister.decimals)} ${payTokenForRegister.symbol}`}</span> to apply for Grimace Staking Club
            </div>
            <div className="w-full flex flex-col gap-4 mt-6">
                {!notNeedCreationFee && <div className="w-full">
                    {isAllowedPayToken ?
                        <div className='w-full rounded-md bg-[#B6FFB5] px-4 py-2 flex gap-2'>
                            <div className='mt-[3px]'>
                                <SuccessSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#0ABA06] font-semibold">
                                {`${payTokenForRegister.symbol} Succesfully approved Grimace Staking Club contract`}
                            </div>
                        </div> :
                        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                            <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                                <div className='mt-[3px]'>
                                    <InfoSVG width={"15"} height={"16"} />
                                </div>
                                <div className="text-[13px] md:text-[15px] text-app-purple">
                                    {`You will need to allow Grimace Staking Club Contract to spent ${payTokenForRegister.symbol}`}
                                </div>
                            </div>
                            <div className="min-w-[180px] w-full md:w-auto">
                                <LoadingButton
                                    loading={isPayTokenApproving}
                                    loadingPosition="center"
                                    variant="contained"
                                    sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                    color="secondary"
                                    onClick={() => onApprovePayToken()}
                                >
                                    <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isPayTokenApproving ? '' : `Allow ${payTokenForRegister.symbol}`}</span>
                                </LoadingButton>
                            </div>
                        </div>
                    }
                </div>}
                <div className="w-full">
                    {isAllowedRewardToken ?
                        <div className='w-full rounded-md bg-[#B6FFB5] px-4 py-2 flex gap-2'>
                            <div className='mt-[3px]'>
                                <SuccessSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#0ABA06] font-semibold">
                                {`${rewardToken.symbol} Succesfully approved Grimace Staking Club contract`}
                            </div>
                        </div> :
                        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                            <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                                <div className='mt-[3px]'>
                                    <InfoSVG width={"15"} height={"16"} />
                                </div>
                                <div className="text-[13px] md:text-[15px] text-app-purple">
                                    {`You will need to allow Grimace Staking Club Contract to spent ${rewardToken.symbol}`}
                                </div>
                            </div>
                            <div className="min-w-[180px] w-full md:w-auto">
                                <LoadingButton
                                    loading={isRewardTokenApproving}
                                    loadingPosition="center"
                                    variant="contained"
                                    sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                                    color="secondary"
                                    onClick={() => onApproveRewardToken()}
                                >
                                    <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>{isRewardTokenApproving ? '' : `Allow ${rewardToken.symbol}`}</span>
                                </LoadingButton>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="w-full flex gap-4 mt-6">
                <div className="basis-1/2">
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                        color="primary"
                        onClick={() => setStep(3)}
                    >
                        <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Back</span>
                    </Button>
                </div>
                <div className="basis-1/2">
                    <LoadingButton
                        loading={isLoading}
                        loadingPosition="center"
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter', backgroundColor: '#7A30E0' }}
                        color="primary"
                        onClick={() => onCreatePool()}
                        disabled={!isPassableForm4}
                    >
                        <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>{isLoading?'':'Finalize'}</span>
                    </LoadingButton>
                </div>
            </div>
        </div>
    )
}