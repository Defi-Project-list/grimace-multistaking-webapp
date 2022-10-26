import React, { useMemo, useState, useEffect, useRef } from 'react'

interface InputProps {
    id: string    
    setEndTime: (_date) => void
}

export default function PoolStopDate({ id, setEndTime }: InputProps) {
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
                    {`Pool Removable Date`}
                </div>
                <input
                    className="bg-white text-[#341461] text-[16px] md:text-[18px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                    id={id}
                    type="date"
                    name="endDate"                    
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
        </div>
    )
}