import { Button } from "@mui/material"
import InfoSVG from "./form_components/InfoSVG"
import LogoURLInput from "../LogoURLInput"
import TokenAddressInput from "../TokenAddressInput"
import validator from 'validator'
import { isAddress } from "@app/utils/utils"
import { useTokenCallback } from "@app/hooks/hooks"
import { useEffect, useState } from "react"
import TokenInfoBox from "./form_components/TokenInfoBox"
import TokenNotFoundBox from "./form_components/TokenNotFoundBox"
import { useGrimaceRegister } from "@app/contexts"

const blockchain = process.env.blockchain

const TOKEN_ADDRESS_ID = 'id_form2_token_box'
const TOKEN_LOGO_ID = 'id_form2_token_logo_box'

interface props {

}

export default function Form1_Content() {
    const { tokenCallback } = useTokenCallback()
    const { stakeToken, stakeTokenLogo, isPassableForm1, onChangeStakeToken, onChangeStakeLogo, setStep } = useGrimaceRegister()
    const [tokenTextValue, setTokenTextValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (stakeToken) {
            let element: any = document.getElementById(TOKEN_ADDRESS_ID)
            if (element) element.value = stakeToken.address
            setTokenTextValue(stakeToken.address)
        }
        if (stakeTokenLogo) {
            let element: any  = document.getElementById(TOKEN_LOGO_ID)
            if (element) element.value = stakeTokenLogo
        }
    }, [])

    const handleStakeToken = async (val: string) => {
        setTokenTextValue(val)
        if (isAddress(val)) {
            setIsLoading(true)
            const token = await tokenCallback(val, blockchain)
            setIsLoading(false)
            if (token) {
                onChangeStakeToken({ ...token, logoURI: '' })
                return
            }
        }
        onChangeStakeToken(undefined)
    }

    const handleStakeTokenLogo = (val: string) => {
        if (validator.isURL(val)) {
            onChangeStakeLogo(val)
            return
        }
        onChangeStakeLogo('')
    }

    return (
        <div className="w-full">
            <div className='w-full flex flex-col md:flex-row md:items-center justify-center gap-4 py-4'>
                <div className="w-full flex flex-col gap-4">
                    <TokenAddressInput id={TOKEN_ADDRESS_ID} onChangeToken={(val) => handleStakeToken(val)} placeHolder1={"Stake Token Address"} placeHolder2={"Put token CA for staking"} />
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[2px]'>
                            <InfoSVG width={"13"} height={"13"} />
                        </div>
                        <div className="text-[11px] text-app-purple font-semibold">
                            Please fill the token address that you will need the stakers to stake.
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-4">
                    <LogoURLInput id={TOKEN_LOGO_ID} onChangeLogo={(val) => handleStakeTokenLogo(val)} placeHolder1={"Stake Token Logo"} placeHolder2={"Put the logo url of stake token"} />
                    <div className='w-full rounded-md bg-app-warning px-4 py-2 flex gap-2'>
                        <div className='mt-[2px]'>
                            <InfoSVG width={"13"} height={"13"} />
                        </div>
                        <div className="text-[11px] text-app-purple font-semibold">
                            Please fill this field with the logo of the stake token, in 100x100px size.
                        </div>
                    </div>
                </div>
            </div>
            {tokenTextValue.length > 0 && !stakeToken && !isLoading && <TokenNotFoundBox />}
            {stakeToken && <TokenInfoBox token={stakeToken} />}
            <div className="w-full flex gap-4 mt-6">
                <Button
                    variant="contained"
                    sx={{ width: '100%', height: '38px', fontFamily: 'Inter', backgroundColor: '#7A30E0' }}
                    color="primary"
                    onClick={() => setStep(2)}
                    disabled={!isPassableForm1}
                >
                    <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Continue</span>
                </Button>
            </div>
        </div>
    )
}