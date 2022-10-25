import React, { useMemo, useState, useEffect } from 'react'
import { Button } from "@mui/material"
import { AppTokenAddress } from '@app/constants/AppConstants'

const buyM31viaPCS = 'https://pancakeswap.finance/swap?outputCurrency=' + AppTokenAddress

interface BuyButtonProps {
    className?: string
}

export default function BuyButton({ className }: BuyButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    
    const handleClose = () => {
        setIsOpen(false)
    }
    return (
        <>            
                <Button
                    variant="contained"
                    className={className}
                    href={buyM31viaPCS}
                    target="_SEJ" 
                    rel="noreferrer"
                    sx={{ minWidth: "90px", borderRadius: "12px" }}
                >
                    Buy Wolf
                </Button>
        </>
    )
}