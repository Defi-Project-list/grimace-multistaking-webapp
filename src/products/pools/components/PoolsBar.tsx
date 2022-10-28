import React, { useState, useEffect, useRef } from 'react'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { FormControlLabel, RadioGroup } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PoolSelectOption from './PoolSelectOption'

export default function PoolsBar({ isLiveSelected, handleSelectShowPools }: { isLiveSelected, handleSelectShowPools: (isLive: boolean) => void }) {
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
        <div className='w-full flex flex-col justify-end gap-4 sm:gap-6 sm:flex-row py-2 mb-4'>
            <FormControl sx={{ width: '100%', boxShadow: '2px 2px 4px #888', borderRadius: '5px', backgroundColor: '#FFFFFF' }} variant="outlined">
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
            <div className="w-full sm:w-auto flex gap-4 items-center justify-end sm:justify-start">
                <div className={`flex gap-2 items-center ${!isLiveSelected?'cursor-pointer':''}`} onClick={() => handleSelectShowPools(true)}>
                    <PoolSelectOption isSelected={isLiveSelected} />
                    <div className='text-app-primary text-[15px] whitespace-nowrap'>Live Pool</div>
                </div>
                <div className={`flex gap-2 items-center ${isLiveSelected?'cursor-pointer':''}`} onClick={() => handleSelectShowPools(false)}>
                    <PoolSelectOption isSelected={!isLiveSelected} />
                    <div className='text-app-primary text-[15px] whitespace-nowrap'>Expired Pool</div>
                </div>       
            </div>
        </div>
    )
}