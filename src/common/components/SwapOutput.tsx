import React, { useMemo, useState, useEffect, useRef } from 'react'
import SwapQtyOutputBox from '@app/common/components/SwapQtyOutputBox'
import { SWAP_INPUTBOX_WRAP } from '@app/utils/utils'

interface TokenOutputProps {
    id: string
    name: string
    decimals: number
    balance: string
    logoURI: string
    readOnly: boolean
    onChange: (val: any) => void
    onOpenSelectModal: () => void
}

export default function SwapOutput({ id, name, decimals, balance, logoURI, readOnly, onChange, onOpenSelectModal }: TokenOutputProps) {
    const [isBorder, setIsBorder] = useState(false)
    const [width, setWidth] = useState(1000)
    const widthRef = useRef<any>()

    const getListSize = () => {
        if (widthRef) {
            const newWidth = widthRef?.current?.clientWidth
            setWidth(newWidth)
        }
    }

    useEffect(() => {
        const newWidth = widthRef?.current?.clientWidth
        setWidth(newWidth)
        window.addEventListener("resize", getListSize)
    })

    const handleFocus = () => {
        setIsBorder(true)
    }

    const handleBlur = () => {
        setIsBorder(false)
    }
    return (
        <div className="w-full flex flex-col rounded-2xl bg-[#131723] py-3 px-[14px] sm:px-5" style={{ border: isBorder ? "1px solid white" : "none" }} ref={widthRef}>
            <div className={`pb-1 relative flex items-center justify-between gap-3 text-[12px] font-normal uppercase text-app-primary`}>
                <span>To</span>
                <span>Balance</span>
                {/* {width <= SWAP_INPUTBOX_WRAP &&
                    <div className="absolute right-0 top-[15px] text-[#FFFFFF]/[.5] text-[16px] rounded-md text-right whitespace-nowrap">
                        <span>{balance}</span>
                    </div>
                } */}
                <div className="absolute right-0 top-[15px] text-[#FFFFFF]/[.5] text-[16px] rounded-md text-right whitespace-nowrap">
                    <span>{balance}</span>
                </div>
            </div>
            <div className='w-full flex gap-2 justify-between items-center w-full mt-2'>
                <div className='w-full flex gap-2 sm:gap-3 items-center'>
                    <div className='flex min-w-[120px] gap-2 py-2 px-3 bg-[#001926] rounded-xl justify-left items-center hover:bg-[#102936]  cursor-pointer' onClick={onOpenSelectModal}>
                        {name && <>
                            <div className="flex items-center justify-center w-6 h-6">
                                <img src={logoURI} width="22" height="22" />
                            </div>
                            <div className='uppercase text-white text-[13px] sm:text-[14px] leading-[1.1] whitespace-nowrap max-w-[70px] overflow-hidden'>{name}</div>
                            <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5.5 5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>}
                    </div>
                    <SwapQtyOutputBox
                        handleFocus={handleFocus}
                        handleBlur={handleBlur}
                        decimals={18}
                        onChange={onChange}
                        id={id}
                        readOnly={readOnly}
                    />
                </div>
                {/* {width>SWAP_INPUTBOX_WRAP && <div className="text-[#FFFFFF]/[.5] text-[18px] rounded-md text-right break-all">
                     <span>{balance}</span>
                 </div>} */}
            </div>
        </div>
    )
}