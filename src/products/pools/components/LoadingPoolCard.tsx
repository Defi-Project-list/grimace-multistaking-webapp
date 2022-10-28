import { Skeleton } from '@mui/material'

export default function LoadingPoolCard() {

    return (
        <div className='w-full bg-white rounded-md py-4 px-4 md:px-8 mb-6' style={{ boxShadow: '2px 2px 4px #888' }}>
            <div className='w-full flex flex-col md:gap-6 md:flex-row'>
                <div className='w-full md:basis-2/5 flex justify-between md:justify-around'>
                    <Skeleton animation="wave" width={"35%"} height={45} />
                    <Skeleton animation="wave" width={"35%"} height={45} />
                </div>
                <div className='w-full md:basis-3/5 flex justify-between md:justify-around'>
                    <Skeleton animation="wave" width={"24%"} height={45} />
                    <Skeleton animation="wave" width={"24%"} height={45} />
                    <Skeleton animation="wave" width={"24%"} height={45} />
                </div>
            </div>
        </div>
    )
}