import React, { useMemo, useState, useEffect, useRef } from 'react'
import AmountInputBox from '@app/common/components/AmountInputBox'
import InputBoxContainer from '@app/common/components/InputBoxContainer'

interface InputProps {
    id: string
    onChange: (val: any) => void
}

export default function TelegramContactInput({ id, onChange }: InputProps) {
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
                    Telegram Contact
                </div>
                <InputBoxContainer>
                    <input
                        id={id}
                        type="text"
                        className="bg-white text-[#341461] text-[16px] md:text-[18px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                        placeholder={'Put the telegram username of person in charge'}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={(event) => onChange(event.target.value)}
                    />
                </InputBoxContainer>
            </div>
        </div>
    )
}