import React, { useMemo, useState, useEffect, useRef } from 'react'
import AmountInputBox from '@app/common/components/AmountInputBox'

interface InputProps {
    id: string
    onChange: (val: any) => void
}

export default function TokenQuantityInput({ id, onChange }: InputProps) {
    const [isBorder, setIsBorder] = useState(false)

    const handleFocus = () => {
        setIsBorder(true)
    }

    const handleBlur = () => {
        setIsBorder(false)
    }
    return (
        <div className={`w-full bg-white rounded-md py-2 px-4 flex gap-4 items-center mt-2 ${isBorder ? 'border border-[#987DF9]' : ''}`} style={{ boxShadow: '1px 1px 3px #606060' }}>
            <AmountInputBox
                placeHolder='Enter the amount to stake'
                handleFocus={handleFocus}
                handleBlur={handleBlur}
                decimals={undefined}
                onChange={onChange}
                id={id}
            />
        </div>
    )
}