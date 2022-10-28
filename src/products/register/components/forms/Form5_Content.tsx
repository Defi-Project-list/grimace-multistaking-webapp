import { Button, Tooltip } from "@mui/material"
import { useGrimaceRegister, useGrimaceStakingClub } from "@app/contexts"
import { copyTextToClipboard, shortenAddress } from "@app/utils/utils"
import { useState } from "react"
import { SidebarItem, SIDEBAR_ROUTES } from "@app/common/layout/LayoutConstants"
import { useRouter } from "next/router"

interface props {

}

export default function Form5_Content() {
    const router = useRouter()
    const {
        createdPoolAddress,
        init_registerValues
    } = useGrimaceRegister()
    const [isCopied, setIsCopied] = useState(false)
    const {updateClubMapPoolInfo} = useGrimaceStakingClub()

    const copyAddress = () => {
        copyTextToClipboard(createdPoolAddress)
            .then(() => {
                setIsCopied(true)
                setTimeout(() => {
                    setIsCopied(false)
                }, 3000)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const onGoBack = () => {
        init_registerValues()
        updateClubMapPoolInfo()
        router.push({
            pathname: SIDEBAR_ROUTES[SidebarItem.POOLS]
        })
    }

    return (
        <div className="w-full">
            <div className="w-full text-[22px] md:text-[25px] text-app-primary flex flex-wrap gap-3 items-center justify-center">
                <div className="text-app-purple font-bold">Your created pool CA:</div>
                <div className="flex gap-2 text-[20px] md:text-[22px] items-center">
                    <div>{shortenAddress(createdPoolAddress, 5)}</div>
                    <Tooltip title="Copy address" placement="bottom" componentsProps={{ tooltip: { sx: { backgroundColor: '#142028', }, } }}>
                        <div className='cursor-pointer' onClick={copyAddress}>
                            <img src='./images/copy.png' width="20" />
                        </div>
                    </Tooltip>
                    <div className='flex justify-end mt-2'>
                        <div className="relative">
                            <div className='absolute right-0 top-0'>
                                {isCopied && <span className='text-[12px] font-light whitespace-nowrap '>Address copied</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full text-center text-[18px] md:text-[20px] text-app-primary mt-6">
                Thanks for joining Grimace Staking Club. Please join the Devs Corner group to speak with the Grimace team: * telegram link here *
            </div>
            <div className="w-full mt-6">
                <Button
                    variant="contained"
                    sx={{ width: '100%', height: '38px', fontFamily: 'Inter', backgroundColor: '#7A30E0' }}
                    color="primary"
                    onClick={() => onGoBack()}
                >
                    <span className='text-[16px] md:text-[18px] text-white font-bold whitespace-nowrap'>Go back to main page</span>
                </Button>
            </div>
        </div>
    )
}