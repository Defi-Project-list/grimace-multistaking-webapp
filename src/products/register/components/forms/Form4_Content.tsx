import AmountInputBox from "@app/common/components/AmountInputBox"
import { parseUnits } from "@ethersproject/units"
import { Button } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import SuccessSVG from "./SuccessSVG"
import { useGrimaceRegister } from "@app/contexts"
const blockchain = process.env.blockchain

interface props {

}

const ID_REWARD_SUPPLY = 'id_reward_supply_input'
const ID_REWARD_PER_BLOCK = 'id_reward_per_block_input'
const ID_STAKER_LOCK_TIME = 'id_staker_lock_time'
const ID_END_TIME = 'id_stake_end_time'
const ID_WEBSITE_URL = 'id_website_url'
const ID_TELEGRAM_CONTACT = 'id_telegram_contact'

export default function Form4_Content() {
    const { setStep } = useGrimaceRegister()

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
            <div className="w-full flex flex-col gap-4 mt-6">
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Total Reward Supply</div>
                        <div className="text-[22px] md:text-[25px] text-app-primary font-bold break-all">5,220 Grimace</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Pool Removable Date</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font- break-all">18/20/2022</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Staker Timelock</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">30 Days</div>
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Reward per Block</div>
                        <div className="text-[22px] md:text-[25px] text-app-primary font-bold break-all">123,456 TKN</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Website URL</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">sampletext.com</div>
                    </div>
                    <div className="w-full md:basis-1/3 flex flex-col items-center md:items-start gap-1">
                        <div className="text-[15px] text-app-primary">Telegram Contanct</div>
                        <div className="text-[20px] md:text-[25px]  text-app-primary font-bold break-all">t.me/sampletext</div>
                    </div>
                </div>
            </div>
            <div className="w-full border-b-2 border-[#7A30E0] mt-6" />
            <div className="w-full text-[18px] text-[20px] text-app-primary mt-6">
                You will need to pay <span className="font-bold">123,456,789 TKN</span> to apply for Grimace Staking Club
            </div>
            <div className="w-full flex flex-col gap-4 mt-6">
                <div className='w-full rounded-md bg-[#B6FFB5] px-4 py-2 flex gap-2'>
                    <div className='mt-[3px]'>
                        <SuccessSVG width={"15"} height={"16"} />
                    </div>
                    <div className="text-[13px] md:text-[15px] text-[#0ABA06] font-semibold">
                        TKN Succesfully approved Grimace Staking Club contract
                    </div>
                </div>
                <div className='w-full rounded-md bg-[#B6FFB5] px-4 py-2 flex gap-2'>
                    <div className='mt-[3px]'>
                        <SuccessSVG width={"15"} height={"16"} />
                    </div>
                    <div className="text-[13px] md:text-[15px] text-[#0ABA06] font-semibold">
                        TKN2 Succesfully approved Grimace Staking Club contract
                    </div>
                </div>
                {/* <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[3px]'>
                            <InfoSVG width={"15"} height={"16"} />
                        </div>
                        <div className="text-[13px] md:text-[15px] text-app-purple">
                            You will need to allow Grimace Staking Club Contract to spent TKN
                        </div>
                    </div>
                    <div className="min-w-[180px] w-full md:w-auto">
                        <Button
                            variant="contained"
                            sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                            color="secondary"
                            onClick={() => setStep(1)}
                        >
                            <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Allow TKN</span>
                        </Button>
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[3px]'>
                            <InfoSVG width={"15"} height={"16"} />
                        </div>
                        <div className="text-[13px] md:text-[15px] text-app-purple">
                            You will need to allow Grimace Staking Club Contract to spent TKN2
                        </div>
                    </div>
                    <div className="min-w-[180px] w-full md:w-auto">
                        <Button
                            variant="contained"
                            sx={{ width: '100%', height: '38px', fontFamily: 'Inter' }}
                            color="secondary"
                            onClick={() => setStep(1)}
                        >
                            <span className='text-[16px] md:text-[18px] font-bold whitespace-nowrap'>Allow TKN2</span>
                        </Button>
                    </div>
                </div> */}
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
                        <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Finish</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}