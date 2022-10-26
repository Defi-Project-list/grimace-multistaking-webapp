import React, { useMemo, useState, useEffect, useRef } from 'react'
import AmountInputBox from '@app/common/components/AmountInputBox'

interface InputProps {
    id: string
    onChange: (val: any) => void
}

export default function RewardPerBlockInput({ id, onChange }: InputProps) {
    const [isBorder, setIsBorder] = useState(false)

    const handleFocus = () => {
        setIsBorder(true)
    }

    const handleBlur = () => {
        setIsBorder(false)
    }
    return (
        <div className={`w-full bg-white rounded-md p-4 flex gap-4 items-center mt-2 ${isBorder ? 'border border-[#987DF9]' : ''}`} style={{ boxShadow: '2px 2px 4px #888' }}>
            <div className={`w-full flex flex-col gap-2`}>
                <div className='w-full text-[14px] md:text-[15px] text-app-purple font-bold'>
                    {`Reward per Block (TKN)`}
                </div>
                <AmountInputBox
                    placeHolder='Enter the amount of reward per block'
                    handleFocus={handleFocus}
                    handleBlur={handleBlur}
                    decimals={undefined}
                    onChange={onChange}
                    id={id}
                />
            </div>
        </div>
    )
}