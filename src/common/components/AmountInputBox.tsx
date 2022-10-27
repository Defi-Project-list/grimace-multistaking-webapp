import InputBoxContainer from './InputBoxContainer'

interface InputBoxProps {
    id: string
    placeHolder: string
    decimals: number
    onChange: (val: any) => void
    handleFocus: () => void
    handleBlur: () => void
}

export default function AmountInputBox({ id, placeHolder, decimals = 18, onChange, handleFocus, handleBlur }: InputBoxProps) {
    return (
        <InputBoxContainer>
            <input
                id={id}
                type="text"
                className="bg-white text-[#341461] text-[18px] md:text-[20px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                placeholder={placeHolder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyPress={(e) => {
                    let ev: any = e.target;
                    ((ev.value.toString().indexOf('.') >= 0) && ev.value.toString().substring(ev.value.toString().indexOf('.') + 1).length >= decimals) && e.preventDefault();
                    ((ev.value.toString().indexOf('.') >= 0) && e.key === '.') && e.preventDefault();
                    ((ev.value.toString().length <= 0) && e.key === '.') && e.preventDefault();
                    (!((e.key === '.') || (e.key >= '0' && e.key <= '9'))) && e.preventDefault();
                }}
                onChange={(event) => onChange(event.target.value)}
            />
        </InputBoxContainer>
    )
}