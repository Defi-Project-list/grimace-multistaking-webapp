import InputBoxContainer from './InputBoxContainer'

interface OutputBoxProps {
    value: string
    handleFocus: () => void
    handleBlur: () => void
}

export default function SwapQtyOutputReadOnlyBox({ value, handleFocus, handleBlur }: OutputBoxProps) {
    return (
        <InputBoxContainer>
            <input
                type="text"
                className="bg-[#131723] text-white text-[22px] sm:text-[24px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                placeholder="0.0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                value={value}
                readOnly
            />
        </InputBoxContainer>
    )
}