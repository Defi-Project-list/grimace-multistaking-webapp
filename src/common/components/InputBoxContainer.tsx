import { ReactNode } from 'react'

export default function InputBoxContainer({ children }: { children: ReactNode }) {
    return (
        <div className='w-full'>
            <form autoComplete="off">
                {children}
            </form>
        </div>
    )
}