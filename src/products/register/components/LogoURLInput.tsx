import React, { useState, useEffect, useRef } from 'react'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'

export default function LogoURLInput({ id, onChangeLogo, placeHolder1, placeHolder2 }: { id:string, onChangeLogo: (val: string) => void, placeHolder1:string, placeHolder2:string }) {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = () => {
        setIsFocused(true)
    }

    const handleBlur = () => {
        setIsFocused(false)
    }

    return (
        <FormControl sx={{ width: '100%', boxShadow: '2px 2px 4px #888', borderRadius: '5px', backgroundColor: '#FFFFFF' }} variant="outlined">
            <OutlinedInput
                id={id}
                type={'text'}
                sx={{ height: '44px' }}
                // value={}
                onChange={(event) => onChangeLogo(event.target.value)}
                placeholder={isFocused ? placeHolder2 : placeHolder1}
                onFocus={handleFocus}
                onBlur={handleBlur}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            edge="end"
                        >
                            <ImageSearchIcon />
                        </IconButton>
                    </InputAdornment>
                }
            />
        </FormControl>
    )
}