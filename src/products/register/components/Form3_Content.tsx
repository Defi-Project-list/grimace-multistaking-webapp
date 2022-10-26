import AmountInputBox from "@app/common/components/AmountInputBox"
import { parseUnits } from "@ethersproject/units"
import { Button } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import PoolStopDate from "./form3/PoolStopDate"
import RewardPerBlockInput from "./form3/RewardPerBlockInput"
import RewardSupplyInput from "./form3/RewardSupplyInput"
import StakerLockTimeInput from "./form3/StakerLockTimeInput"
import TelegramContactInput from "./form3/TelegramContactInput"
import WebsiteURLInput from "./form3/WebsiteURLInput"
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
            <div className='w-full rounded-md bg-app-warning p-4 flex gap-2 mt-4'>
                <div className='mt-[3px]'>
                    <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.5 1.86364C4.11098 1.86364 1.36364 4.61098 1.36364 8C1.36364 11.389 4.11098 14.1364 7.5 14.1364C10.889 14.1364 13.6364 11.389 13.6364 8C13.6364 4.61098 10.889 1.86364 7.5 1.86364ZM0 8C0 3.85786 3.35786 0.5 7.5 0.5C11.6421 0.5 15 3.85786 15 8C15 12.1421 11.6421 15.5 7.5 15.5C3.35786 15.5 0 12.1421 0 8Z" fill="#F3BA2F" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.50018 4.59082C7.87674 4.59082 8.182 4.89608 8.182 5.27264V7.99991C8.182 8.37647 7.87674 8.68173 7.50018 8.68173C7.12362 8.68173 6.81836 8.37647 6.81836 7.99991V5.27264C6.81836 4.89608 7.12362 4.59082 7.50018 4.59082Z" fill="#F3BA2F" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.81836 10.7277C6.81836 10.3512 7.12362 10.0459 7.50018 10.0459H7.507C7.88355 10.0459 8.18881 10.3512 8.18881 10.7277C8.18881 11.1043 7.88355 11.4095 7.507 11.4095H7.50018C7.12362 11.4095 6.81836 11.1043 6.81836 10.7277Z" fill="#F3BA2F" />
                    </svg>
                </div>
                <div className="text-[13px] md:text-[15px] text-app-purple">
                    Reward Amount / Supply are total amount of WOLF that you are going to send to your Dojo Pool as reward for staking.
                </div>
            </div>
            <RewardSupplyInput id={ID_REWARD_SUPPLY} onChange={onRewardSupplyChange} />
            <div className="w-full bg-[#FFD7D7] rounded-md p-4 mt-2">
                <div className="flex gap-2">
                    <div className="mt-[3px]">
                        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                        </svg>
                    </div>
                    <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                        Total Reward Supply must be greater than 0
                    </div>
                </div>
            </div>
            <div className="w-full flex gap-4 flex-col md:flex-row mt-4">
                <div className="w-full flex flex-col gap-2">
                    <PoolStopDate id={ID_END_TIME} setEndTime={setEndTime} />
                    <div className="w-full bg-[#FFD7D7] rounded-md p-4">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                                </svg>
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Please enter a valid date
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <StakerLockTimeInput id={ID_STAKER_LOCK_TIME} onChange={onStakerLockTimeChange} />
                    <div className="w-full bg-[#FFD7D7] rounded-md p-4">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                                </svg>
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Days lock should be greater than 0
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <RewardPerBlockInput id={ID_REWARD_PER_BLOCK} onChange={onRewardPerBlockChange} />
                    <div className="w-full bg-[#FFD7D7] rounded-md p-4">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                                </svg>
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
                    <div className="w-full bg-[#FFD7D7] rounded-md p-4">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                                </svg>
                            </div>
                            <div className="text-[13px] md:text-[15px] text-[#FF5858] font-semibold">
                                Website url cannot be empty
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <TelegramContactInput id={ID_TELEGRAM_CONTACT} onChange={setTelegramContact} />
                    <div className="w-full bg-[#FFD7D7] rounded-md p-4">
                        <div className="flex gap-2">
                            <div className="mt-[3px]">
                                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.19515 0.6997C4.32302 0.571834 4.49644 0.5 4.67727 0.5H10.3227C10.5036 0.5 10.677 0.571834 10.8048 0.6997L14.8003 4.69515C14.9282 4.82302 15 4.99644 15 5.17727V10.8227C15 11.0036 14.9282 11.177 14.8003 11.3048L10.8048 15.3003C10.677 15.4282 10.5036 15.5 10.3227 15.5H4.67727C4.49644 15.5 4.32302 15.4282 4.19515 15.3003L0.1997 11.3048C0.0718342 11.177 0 11.0036 0 10.8227V5.17727C0 4.99644 0.0718342 4.82302 0.1997 4.69515L4.19515 0.6997ZM4.95969 1.86364L1.36364 5.45969V10.5403L4.95969 14.1364H10.0403L13.6364 10.5403V5.45969L10.0403 1.86364H4.95969Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0279 5.47216C10.2942 5.73843 10.2942 6.17013 10.0279 6.4364L5.93698 10.5273C5.67071 10.7936 5.23901 10.7936 4.97274 10.5273C4.70647 10.261 4.70647 9.82934 4.97274 9.56307L9.06365 5.47216C9.32992 5.20589 9.76162 5.20589 10.0279 5.47216Z" fill="#FF5858" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.69991 5.19994C4.96618 4.93368 5.39788 4.93368 5.66415 5.19994L9.75506 9.29085C10.0213 9.55712 10.0213 9.98882 9.75506 10.2551C9.48879 10.5214 9.05709 10.5214 8.79082 10.2551L4.69991 6.16418C4.43365 5.89791 4.43365 5.46621 4.69991 5.19994Z" fill="#FF5858" />
                                </svg>
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
                        <span className='text-[16px] md:text-[18px] text-app-primary font-bold whitespace-nowrap'>Back</span>
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