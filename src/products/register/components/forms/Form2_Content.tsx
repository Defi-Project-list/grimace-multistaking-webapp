import { Button } from "@mui/material"
import InfoSVG from "./InfoSVG"
import LogoURLInput from "../LogoURLInput"
import TokenAddressInput from "../TokenAddressInput"
import validator from 'validator'
import { useTokenCallback } from "@app/hooks/hooks"
import { useEffect, useState } from "react"
import { isAddress } from "@app/utils/utils"
import TokenInfoBox from "./TokenInfoBox"
import TokenNotFoundBox from "./TokenNotFoundBox"
import { useGrimaceRegister } from "@app/contexts"

const blockchain = process.env.blockchain

const TOKEN_ADDRESS_ID = 'id_form2_token_box'
const TOKEN_LOGO_ID = 'id_form2_token_logo_box'

interface props {

}

export default function Form2_Content() {
    const { tokenCallback } = useTokenCallback()
    const { rewardToken, rewardTokenLogo, isPassableForm2, onChangeRewardToken, onChangeRewardLogo, setStep } = useGrimaceRegister()
    const [tokenTextValue, setTokenTextValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (rewardToken) {
            let element: any = document.getElementById(TOKEN_ADDRESS_ID)
            if (element) element.value = rewardToken.address
            setTokenTextValue(rewardToken.address)
        }
        if (rewardTokenLogo) {
            let element: any = document.getElementById(TOKEN_LOGO_ID)
            if (element) element.value = rewardTokenLogo
        }
    }, [])

    const handleRewardToken = async (val: string) => {
        setTokenTextValue(val)
        if (isAddress(val)) {
            setIsLoading(true)
            const token = await tokenCallback(val, blockchain)
            setIsLoading(false)
            if (token) {
                onChangeRewardToken({ ...token, logoURI: '' })
                return
            }
        }
        onChangeRewardToken(undefined)
    }

    const handleRewardTokenLogo = (val: string) => {
        if (validator.isURL(val)) {
            onChangeRewardLogo(val)
            return
        }
        onChangeRewardLogo('')
    }

    return (
        <div className="w-full">
            <div className='w-full flex flex-col md:flex-row md:items-center justify-center gap-4 py-4'>
                <div className="w-full flex flex-col gap-4">
                    <TokenAddressInput id={TOKEN_ADDRESS_ID} onChangeToken={(val) => handleRewardToken(val)} placeHolder1={"Reward Token Address"} placeHolder2={"Put token CA for rewards"} />
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[2px]'>
                            <InfoSVG width={"13"} height={"13"} />
                        </div>
                        <div className="text-[11px] text-app-purple font-semibold">
                            Please fill the token address that you will give as stake rewards.
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-4">
                    <LogoURLInput id={TOKEN_LOGO_ID} onChangeLogo={(val) => handleRewardTokenLogo(val)} placeHolder1={"Reward Token Logo"} placeHolder2={"Put the logo url of reward token"} />
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[2px]'>
                            <InfoSVG width={"13"} height={"13"} />
                        </div>
                        <div className="text-[11px] text-app-purple font-semibold">
                            Please fill this field with the logo of the reward token, in 100x100px size.
                        </div>
                    </div>
                </div>
            </div>
            {tokenTextValue.length > 0 && !rewardToken && !isLoading && <TokenNotFoundBox />}
            {rewardToken && <TokenInfoBox token={rewardToken} />}
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
                        disabled={!isPassableForm2}
                    >
                        <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Continue</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}