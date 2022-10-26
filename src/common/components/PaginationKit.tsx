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
            backgroundColor: '#987DF9',
        },
        "&& .Mui-selected": {
            backgroundColor: "linear-gradient(180deg, #FFFFFF -10%, #FFFFFF 30%)"
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
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    height: '30px',    
}

export default function PaginationKit({ rowsPerPage, count, page, onSelectRows, onSelectPage }: SelectProps) {

    return (
        <div className="flex flex-col gap-2 md:gap-6 flex-col-reverse md:flex-row items-center my-4">
            <div className="flex gap-2 items-center">
                <div className='text-app-primary text-[14px]'>Show</div>
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
                <div className='text-app-primary text-[14px]'>results</div>
            </div>
            <Pagination count={count} color="primary" showFirstButton showLastButton page={page} shape="rounded" onChange={onSelectPage} size="small" />
        </div>
    )
}
