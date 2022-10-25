import React, { useState, useEffect, useRef } from 'react'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { FormControlLabel, RadioGroup } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PoolSelectOption from './PoolSelectOption'

export default function PoolsBar({ isSelectedLivePools, handleSelectShowPools }: { isSelectedLivePools, handleSelectShowPools: (isLive: boolean) => void }) {
    const [isFocused, setIsFocused] = useState(false)
    const handleChange = (value: string) => {

    }

    const handleFocus = () => {
        setIsFocused(true)
    }

    const handleBlur = () => {
        setIsFocused(false)
    }

    return (
        <div className='w-full flex flex-col justify-end gap-4 sm:flex-row'>
            <FormControl sx={{ m: 1, width: '100%', boxShadow: '2px 2px 4px #333', borderRadius: '5px' }} variant="outlined">
                <OutlinedInput
                    id="outlined-search-pool"
                    type={'text'}
                    sx={{ height: '44px' }}
                    // value={}
                    onChange={(event) => handleChange(event.target.value)}
                    placeholder={isFocused ? 'Find Pool by its address, reward address or stake address' : 'Search Pool'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>
            <div className="flex gap-4 items-center">
                <div className={`flex gap-2 items-center ${!isSelectedLivePools?'cursor-pointer':''}`} onClick={() => handleSelectShowPools(true)}>
                    <PoolSelectOption isSelected={isSelectedLivePools} />
                    <div className='text-app-primary text-[15px] whitespace-nowrap'>Live Pool</div>
                </div>
                <div className={`flex gap-2 items-center ${isSelectedLivePools?'cursor-pointer':''}`} onClick={() => handleSelectShowPools(false)}>
                    <PoolSelectOption isSelected={!isSelectedLivePools} />
                    <div className='text-app-primary text-[15px] whitespace-nowrap'>Expired Pool</div>
                </div>       
            </div>
        </div>
    )
}