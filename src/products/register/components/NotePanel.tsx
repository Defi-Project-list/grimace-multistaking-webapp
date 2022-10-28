import { GrimaceClubAddress } from "@app/constants/AppConstants"
import { useGrimaceRegister } from "@app/contexts"
import { formatEther } from "@app/utils/utils"

export default function Register() {
    const { payTokenForRegister, payAmountForRegister} = useGrimaceRegister()
    return (
        <div className='xl:basis-1/3 w-full flex flex-col gap-6'>
            <div className='w-full rounded-md bg-app-warning p-4'>
                <div className='text-[18px] md:text-[20px] font-bold text-app-primary my-1'>
                    KYC Verification
                </div>
                <div className="text-[16px] md:text-[18px] text-app-primary font-normal">
                    Once you complete your registration, you will need to submit your KYC information into our telegram support (Link is written on the last step of registration), once we verify your submission your Grimace Staking Club will be published
                </div>
            </div>
            <div className='w-full rounded-md bg-app-warning p-4'>
                <div className='text-[18px] md:text-[20px] font-bold text-app-primary my-1'>
                    Aditional Setting
                </div>
                <div className="text-[16px] md:text-[18px] text-app-primary font-normal">
                    {`You will need to exclude our Grimace Staking Club creator contract `}<span className="font-bold">{`${GrimaceClubAddress}`}</span>{` from any taxes / fee, dividend, transfer limit and max wallet`}
                    <br /><br />
                    If the reward token has transfer limit or max wallet functionality on a transfer, you can create a Grimace Staking Club with reward supple below or equal to the limit, and after you obtain your pool address, you can exclude it from the max transfer and wallet limit and the add the additional supply later (please contact us for assitance)
                    <br /><br />
                    You will also need to exclude your Grimace Staking Club from any limit and fees on the stake token contract if there’s any fee or limit applied
                </div>
            </div>
            <div className='w-full rounded-md bg-app-warning p-4'>
                <div className='text-[18px] md:text-[20px] font-bold text-app-primary my-1'>
                    Simple Pricing
                </div>
                <div className="text-[16px] md:text-[18px] text-app-primary font-normal">
                    {`We have a few options of pricing, if you create a Grimace Staking Club with Grimace as the stake token or reward token, then you will not be charged with Grimace Staking Club creation fee, otherwise you will be charged `}<span className="font-bold">{payTokenForRegister?`${formatEther(payAmountForRegister, payTokenForRegister.decimals, 2, true)} ${payTokenForRegister.symbol}`:''}</span>
                </div>
            </div>
        </div>
    )
}