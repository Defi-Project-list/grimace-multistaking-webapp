import AmountInputBox from "@app/common/components/AmountInputBox"
import { parseUnits } from "@ethersproject/units"
import { Button } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import InfoSVG from "./forms/InfoSVG"
import PoolStopDate from "./forms/PoolStopDate"
import RewardPerBlockInput from "./forms/RewardPerBlockInput"
import RewardSupplyInput from "./forms/RewardSupplyInput"
import StakerLockTimeInput from "./forms/StakerLockTimeInput"
import TelegramContactInput from "./forms/TelegramContactInput"
import WarnSVG from "./forms/WarnSVG"
import WebsiteURLInput from "./forms/WebsiteURLInput"
import LogoURLInput from "./LogoURLInput"
import TokenAddressInput from "./TokenAddressInput"

interface props {
    setStep: (val: number) => void,
    onChangeRewardToken: (val: string) => void,
    onChangeRewardLogo: (val: string) => void
}

const ID_REWARD_SUPPLY = 'id_reward_supply_input'
const ID_REWARD_PER_BLOCK = 'id_reward_per_block_input'
const ID_STAKER_LOCK_TIME = 'id_staker_lock_time'
const ID_END_TIME = 'id_stake_end_time'
const ID_WEBSITE_URL = 'id_website_url'
const ID_TELEGRAM_CONTACT = 'id_telegram_contact'

export default function Form3_Content(
    {
        setStep,
        onChangeRewardToken,
        onChangeRewardLogo
    }: props
) {
    const [rewardSupply, setRewardSupply] = useState(BigNumber.from(0))
    const [rewardPerBlock, setRewardPerBlock] = useState(BigNumber.from(0))
    const [endTime, setEndTime] = useState<Date>()
    const [stakerLockTime, setStakerLockTime] = useState(BigNumber.from(0))
    const [websiteURL, setWebsiteURL] = useState('')
    const [telegramContact, setTelegramContact] = useState('')

    const onRewardSupplyChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            // if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), inToken?.decimals)
            // else amount = parseUnits(val, inToken?.decimals)
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), 18)
            else amount = parseUnits(val, 18)
        }
        setRewardSupply(amount)
    }

    const initRewardSupplyBox = () => {
        setRewardSupply(BigNumber.from(0))
        let element: any = document.getElementById(ID_REWARD_SUPPLY)
        if (element) element.value = ""
    }

    const onRewardPerBlockChange = (val: string) => {
        let amount = BigNumber.from(0)
        if (val.length > 0) {
            // if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), inToken?.decimals)
            // else amount = parseUnits(val, inToken?.decimals)
            if (val.substring(val.indexOf('.') + 1).length <= 0) amount = parseUnits(val.substring(0, val.indexOf('.')), 18)
            else amount = parseUnits(val, 18)
        }
        setRewardPerBlock(amount)
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

    const initStakerLockTimeBox = () => {
        setStakerLockTime(BigNumber.from(0))
        let element: any = document.getElementById(ID_STAKER_LOCK_TIME)
        if (element) element.value = ""
    }

    return (
        <div className="w-full">
            <div className="w-full flex flex-col md:flex-row gap-4">
                <div className='md:basis-1/2 w-full bg-white rounded-md p-4 flex gap-4 items-center' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className="w-[48px] xl:w-[56px]">
                        <img src='./images/Logomark_GrimaceCoin.png' width="100%" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[22px] md:text-[25px] text-app-purple font-bold">
                            Stake TKN
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            TKN | 18 Decimal
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            CA: 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
                        </div>
                    </div>
                </div>
                <div className='md:basis-1/2 w-full bg-white rounded-md p-4 flex gap-4 items-center' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className="w-[48px] xl:w-[56px]">
                        <img src='./images/Logomark_GrimaceCoin.png' width="100%" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[22px] md:text-[25px] text-app-purple font-bold">
                            Reward TKN
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple">
                            TKN | 18 Decimal
                        </div>
                        <div className="text-[14px] md:text-[15px] text-app-purple break-all mt-2">
                            CA: 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2 mt-4'>
                <div className='mt-[3px]'>
                    <InfoSVG width={"15"} height={"16"} />
                </div>
                <div className="text-[13px] md:text-[15px] text-app-purple">
                    Reward Amount / Supply are total amount of WOLF that you are going to send to your Dojo Pool as reward for staking.
                </div>
            </div>
            <RewardSupplyInput id={ID_REWARD_SUPPLY} onChange={onRewardSupplyChange} />
            <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2 mt-2">
                <div className="flex gap-2">
                    <div className="mt-[3px]">
                        <WarnSVG width={"15"} height={"16"} />
                    </div>
                    <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                        Total Reward Supply must be greater than 0
                    </div>
                </div>
            </div>
            <div className="w-full border-b-2 border-[#7A30E0] mt-6" />
            <div className="w-full flex gap-4 flex-col md:flex-row mt-4">
                <div className="w-full flex flex-col gap-2">
                    <PoolStopDate id={ID_END_TIME} setEndTime={setEndTime} />
                    <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Please enter a valid date
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <StakerLockTimeInput id={ID_STAKER_LOCK_TIME} onChange={onStakerLockTimeChange} />
                    <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Days lock should be greater than 0
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <RewardPerBlockInput id={ID_REWARD_PER_BLOCK} onChange={onRewardPerBlockChange} />
                    <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Reward per block should be greater than 0
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex gap-4 flex-col md:flex-row mt-4">
                <div className="w-full flex flex-col gap-2">
                    <WebsiteURLInput id={ID_WEBSITE_URL} onChange={setWebsiteURL} />
                    <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Website url cannot be empty
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <TelegramContactInput id={ID_TELEGRAM_CONTACT} onChange={setTelegramContact} />
                    <div className="w-full bg-[#FFD7D7] rounded-md px-4 py-2">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <WarnSVG width={"15"} height={"16"} />
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Telegram PIC Cannot be empty
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex gap-4 mt-6">
                <div className="basis-1/2">
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                        color="primary"
                        onClick={() => setStep(1)}
                    >
                        <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Back</span>
                    </Button>
                </div>
                <div className="basis-1/2">
                    <Button
                        variant="contained"
                        sx={{ width: '100%', height: '38px', fontFamily: 'Inter', backgroundColor: '#7A30E0' }}
                        color="primary"
                        onClick={() => setStep(3)}
                    >
                        <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Continue</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}