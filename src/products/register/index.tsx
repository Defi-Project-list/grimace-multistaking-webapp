import React, { useState, useEffect, useRef } from 'react'
import { AppTokenAddress } from "@app/constants/AppConstants"
import { useRouter } from 'next/router'
import NotePanel from './components/NotePanel'
import FormProgress from './components/FormProgress'
import Form1_Content from './components/Form1_Content'
import Form2_Content from './components/Form2_Content'
import Form3_Content from './components/Form3_Content'
import Form4_Content from './components/Form4_Content'

export default function Register() {
    const router = useRouter()
    const [step, setStep] = useState(3)

    const onChangeStakeToken = (val: string) => {

    }

    const onChangeStakeLogo = (val: string) => {

    }

    const onChangeRewardToken = (val: string) => {

    }

    const onChangeRewardLogo = (val: string) => {

    }

    return (
        <div className='w-full bg-app-common'>
            <div className={`w-full flex justify-center items-center h-screen lg:min-h-[480px] lg:h-auto bg-[#FFFFFF] bg-[url('splash_register.png')] bg-center bg-cover bg-no-repeat`}>
                <div className='w-full px-5 md:px-6 xl:px-8 flex gap-8 flex-col-reverse lg:flex-row lg:justify-between items-center'>
                    <div className='w-full flex flex-col'>
                        <div className='w-full border-t-2 border-[#F3BA2F] lg:border-0 pt-2 leading-[1.2] text-[36px] sm:text-[40px] md:text-[44px] lg:text-[28px] xl:text-[50px] text-white font-bold'>
                            Devs Corner
                        </div>
                        <div className='w-full font-light text-white text-[18px] md:text-[20px] lg:border-b-2 lg:border-[#F3BA2F]'>
                            Register your tokens to join Grimace Staking Club
                        </div>
                    </div>
                    <div className='logo-size'>
                        <img src='./images/Logomark_GrimaceCoin.png' width="100%" />
                    </div>
                </div>
            </div>
            <div className='w-full p-4 md:p-6 flex flex-col xl:flex-row gap-6 items-start'>
                <div className='xl:basis-2/3 w-full bg-white rounded-md p-4 md:p-6' style={{ boxShadow: '2px 2px 4px #888' }}>
                    <div className='w-full text-[36px] sm:text-[40px] md:text-[44px] lg:text-[28px] xl:text-[50px] text-app-primary font-bold'>
                        Apply for Grimace Staking Club
                    </div>
                    <div className='text-[18px] md:text-[20px] text-app-primary mt-4'>
                        Apply a Grimace Staking Club for your project, so that your investors are able to stake the Token and earn Rewards. Grimace Registration is very simple, you just have to follow the form below to apply for your Grimace Pool.
                    </div>
                    <FormProgress step={step} />
                    {step === 1 && <Form1_Content setStep={setStep} onChangeStakeToken={onChangeStakeToken} onChangeStakeLogo={onChangeStakeLogo} />}
                    {step === 2 && <Form2_Content setStep={setStep} onChangeRewardToken={onChangeRewardToken} onChangeRewardLogo={onChangeRewardLogo} />}
                    {step === 3 && <Form3_Content setStep={setStep} onChangeRewardToken={onChangeRewardToken} onChangeRewardLogo={onChangeRewardLogo} />}
                    {step === 4 && <Form4_Content setStep={setStep} onChangeRewardToken={onChangeRewardToken} onChangeRewardLogo={onChangeRewardLogo} />}
                </div>
                <NotePanel />
            </div>
            <div className='w-full bg-app-warning p-2 flex justify-center'>
                <div className='w-full text-[11px] text-app-primary font-normal max-w-[768px]'>
                    <span className="font-bold">Disclaimer</span>: The information provided shall not in any way constitute a recommendation as to whether you should invest in any product discussed. We accept no liability for any loss occasioned to any person acting or refraining from action as a result of any material provided or published.
                </div>
            </div>
        </div>
    )
}