import AmountInputBox from "@app/common/components/AmountInputBox"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { Button } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import InfoSVG from "./InfoSVG"
import PoolStopDate from "./PoolStopDate"
import RewardPerBlockInput from "./RewardPerBlockInput"
import RewardSupplyInput from "./RewardSupplyInput"
import StakerLockTimeInput from "./StakerLockTimeInput"
import TelegramContactInput from "./TelegramContactInput"
import WarnSVG from "./WarnSVG"
import WebsiteURLInput from "./WebsiteURLInput"
import { useGrimaceRegister } from "@app/contexts"
import validator from 'validator'
import { getShortDate_ } from "@app/utils/utils"

const blockchain = process.env.blockchain

interface props {

}

const ID_REWARD_SUPPLY = 'id_reward_supply_input'
const ID_REWARD_PER_BLOCK = 'id_reward_per_block_input'
const ID_STAKER_LOCK_TIME = 'id_staker_lock_time'
const ID_END_TIME = 'id_stake_end_time'
const ID_WEBSITE_URL = 'id_website_url'
const ID_TELEGRAM_CONTACT = 'id_telegram_contact'

export default function Form3_Content() {
    const {
        stakeToken,
        stakeTokenLogo,
        rewardToken,
        rewardTokenLogo,
        rewardSupply,
        rewardPerBlock,
        endTime,
        stakerLockTime,
        websiteURL,
        telegramContact,
        isPassableForm3,
        setRewardSupply,
        setRewardPerBlock,
        setStakerLockTime,
        setEndTime,
        setWebsiteURL,
        setTelegramContact,
        setStep
    } = useGrimaceRegister()

    useEffect(() => {
        if (rewardSupply.gt(0)) setRewardSupplyBoxValue(rewardSupply)
        if (rewardPerBlock.gt(0)) setRewardPerBlockBoxValue(rewardPerBlock)
        if (stakerLockTime.gt(0)) setStakerLockTimeBoxValue(stakerLockTime)
        if (endTime.gt(0)) setEndTimeBoxValue(endTime)
        if (websiteURL.length > 0) setWebsiteURLBoxValue(websiteURL)
        if (telegramContact.length > 0) setTelegramContactBoxValue(telegramContact)
    }, [])

    const onRewardSupplyChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), rewardToken?.decimals)
            else amount = parseUnits(val, rewardToken?.decimals)
        }
        setRewardSupply(amount)
    }

    const setRewardSupplyBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_REWARD_SUPPLY)
        if (element) element.value = formatUnits(val, rewardToken?.decimals)
    }

    const initRewardSupplyBox = () => {
        setRewardSupply(BigNumber.from(0))
        let element: any = document.getElementById(ID_REWARD_SUPPLY)
        if (element) element.value = ""
    }

    const onRewardPerBlockChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), rewardToken?.decimals)
            else amount = parseUnits(val, rewardToken?.decimals)
        }
        setRewardPerBlock(amount)
    }

    const setRewardPerBlockBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_REWARD_PER_BLOCK)
        if (element) element.value = formatUnits(val, rewardToken?.decimals)
    }

    const initRewardPerBlockBox = () => {
        setRewardPerBlock(BigNumber.from(0))
        let element: any = document.getElementById(ID_REWARD_PER_BLOCK)
        if (element) element.value = ""
    }

    const onStakerLockTimeChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            amount = BigNumber.from(Math.floor(Number(val) * 86400))
        }
        setStakerLockTime(amount)
    }

    const setStakerLockTimeBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_STAKER_LOCK_TIME)
        if (element) element.value = Number(val) / 86400
    }

    const initStakerLockTimeBox = () => {
        setStakerLockTime(BigNumber.from(0))
        let element: any = document.getElementById(ID_STAKER_LOCK_TIME)
        if (element) element.value = ""
    }

    const onEndTimeChange = (d: Date) => {
        let timestamp = ((new Date(d)).getTime() / 1000)
        timestamp = Math.floor(timestamp/86400)*86400        
        setEndTime(BigNumber.from(timestamp))
    }

    const setEndTimeBoxValue = (val: BigNumber) => {
        let element: any = document.getElementById(ID_END_TIME)        
        if (element) element.value = getShortDate_(new Date(Number(val) * 1000))
    }

    const setWebsiteURLBoxValue = (val: string) => {
        let element: any = document.getElementById(ID_WEBSITE_URL)
        if (element) element.value = val
    }

    const setTelegramContactBoxValue = (val: string) => {
        let element: any = document.getElementById(ID_TELEGRAM_CONTACT)
        if (element) element.value = val
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
                            <span className="text-app-primary">{`Stake `}</span>{`${stakeToken ? stakeToken.name : ''}`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            {`${stakeToken ? stakeToken.symbol : ''} | ${stakeToken ? stakeToken.decimals : ''} Decimal`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            {`CA: ${stakeToken ? stakeToken.address : ''}`}
                        </div>
                    </div>
                </div>
                <div className='md:basis-1/2 w-full bg-white rounded-md p-4 flex gap-4 items-center' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className="w-[48px] xl:w-[56px]">
                        <img src={rewardTokenLogo} width="100%" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[22px] md:text-[25px] text-app-purple font-bold">
                            <span className="text-app-primary">{`Reward `}</span>{`${rewardToken ? rewardToken.name : ''}`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            {`${rewardToken ? rewardToken.symbol : ''} | ${rewardToken ? rewardToken.decimals : ''} Decimal`}
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            {`CA: ${rewardToken ? rewardToken.address : ''}`}
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2 mt-4'>
                <div className='mt-[3px]'>
                    <InfoSVG width={"15"} height={"16"} />
                </div>
                <div className="text-[13px] md:text-[15px] text-app-purple">
                    {`Reward Amount / Supply are total amount of `}<span className="font-bold">{rewardToken ? rewardToken.symbol : ''}</span>{` that you are going to send to your Dojo Pool as reward for staking.`}
                </div>
            </div>
            <RewardSupplyInput id={ID_REWARD_SUPPLY} onChange={onRewardSupplyChange} />
            {!rewardSupply.gt(0) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2 mt-2">
                <div className="flex gap-2">
                    <div className="mt-[3px]">
                        <WarnSVG width={"15"} height={"16"} />
                    </div>
                    <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                        Total Reward Supply must be greater than 0
                    </div>
                </div>
            </div>}
            <div className="w-full border-b-2 border-[#7A30E0] mt-6" />
            <div className="w-full flex gap-4 flex-col md:flex-row mt-4">
                <div className="w-full flex flex-col gap-2">
                    <PoolStopDate id={ID_END_TIME} setEndTime={onEndTimeChange} />
                    {!(Number(endTime) > Math.floor((new Date()).getTime() / 1000)) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Please enter a valid date
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <StakerLockTimeInput id={ID_STAKER_LOCK_TIME} onChange={onStakerLockTimeChange} />
                    {!stakerLockTime.gt(0) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Days lock should be greater than 0
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <RewardPerBlockInput id={ID_REWARD_PER_BLOCK} onChange={onRewardPerBlockChange} />
                    {!rewardPerBlock.gt(0) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Reward per block should be greater than 0
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
            <div className="w-full flex gap-4 flex-col md:flex-row mt-4">
                <div className="w-full flex flex-col gap-2">
                    <WebsiteURLInput id={ID_WEBSITE_URL} onChange={setWebsiteURL} />
                    {!validator.isURL(websiteURL) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Website url cannot be empty
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <TelegramContactInput id={ID_TELEGRAM_CONTACT} onChange={setTelegramContact} />
                    {!(telegramContact.length > 3) && <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Telegram PIC Cannot be empty
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
            <div className="w-full flex gap-4 mt-6">
                <div className="basis-1/2">
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                        color="primary"
                        onClick={() => setStep(2)}
                    >
                        <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Back</span>
                    </Button>
                </div>
                <div className="basis-1/2">
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter', backgroundColor: '#7A30E0' }}
                        color="primary"
                        onClick={() => setStep(4)}
                        disabled={!isPassableForm3}
                    >
                        <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Continue</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}