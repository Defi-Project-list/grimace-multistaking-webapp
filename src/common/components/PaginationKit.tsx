import React, { useMemo, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

interface SelectProps {
    rowsPerPage: number
    count: number
    page: number
    onSelectRows: (event: SelectChangeEvent) => void
    onSelectPage: (event: React.ChangeEvent<unknown>, value: number) => void
}

const MenuProps = {
    sx: {
        "ul": {
            backgroundColor: '#1E2536',
        },
        "&& .Mui-selected": {
            backgroundColor: "linear-gradient(180deg, #161f35 -10%, #1E2536 30%)"
        },
        "& .Mui-Root": {
        },
        "&& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderWidth: "0px"
        },
    },
    field: {
        border: "none"
    },
    PaperProps: {
        style: {
            maxHeight: '120px'
        },
    },
}

const MuiSelectStyle = {
    backgroundColor: '#1E2536',
    borderRadius: '12px',
    height: '30px',    
}

export default function PaginationKit({ rowsPerPage, count, page, onSelectRows, onSelectPage }: SelectProps) {

    return (
        <div className="w-full flex flex-col flex-col-reverse md:flex-row md:justify-between items-center mt-2">
            <div className="flex gap-2 items-center">
                <div className='text-white text-[14px]'>Show</div>
                <FormControl sx={{ m: 1, width: 70 }} size="small">
                    <Select
                        displayEmpty
                        // input={<OutlinedInput />}
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={rowsPerPage.toString()}
                        onChange={onSelectRows}
                        style={MuiSelectStyle}
                        MenuProps={MenuProps}
                    >
                        <MenuItem value={3}><div className='w-full text-center'>3</div></MenuItem>w-full 
                        <MenuItem value={5}><div className='w-full text-center'>5</div></MenuItem>
                        <MenuItem value={10}><div className='w-full text-center'>10</div></MenuItem>
                        <MenuItem value={20}><div className='w-full text-center'>20</div></MenuItem>
                        <MenuItem value={50}><div className='w-full text-center'>50</div></MenuItem>
                        <MenuItem value={0}><div className='w-full text-center'>All</div></MenuItem>
                    </Select>
                </FormControl>
                <div className='text-white text-[14px]'>results</div>
            </div>
            <Pagination count={count} showFirstButton showLastButton page={page} onChange={onSelectPage} size="small" />
        </div>
    )
}
