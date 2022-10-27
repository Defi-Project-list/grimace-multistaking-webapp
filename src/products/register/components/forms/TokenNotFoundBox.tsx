import React, { useMemo, useState, useEffect, useRef } from 'react'

export default function TokenNotFoundBox() {

    return (
        <div className="w-full bg-[#FFD7D7] rounded-md p-4 mt-4">
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex gap-2 items-center">
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 23C18.5751 23 23.5 18.0751 23.5 12C23.5 5.92487 18.5751 1 12.5 1C6.42487 1 1.5 5.92487 1.5 12C1.5 18.0751 6.42487 23 12.5 23Z" stroke="#FF5858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.8 8.70001L9.19995 15.3" stroke="#FF5858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.19995 8.70001L15.8 15.3" stroke="#FF5858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-[18px] md:text-[20px] text-[#FF5858] font-bold">
                        Token <span className="underline underline-offset-2">Not</span> Found!
                    </div>
                </div>
                <div className="text-[18px] md:text-[20px] text-app-primary">
                    Please check if the entered address is correct
                </div>
            </div>
        </div>
    )
}