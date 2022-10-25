import InputBoxContainer from './InputBoxContainer'

interface InputBoxProps {
    id: string
    readOnly: boolean
    decimals: number
    onChange: (val: any) => void
    handleFocus: () => void
    handleBlur: () => void
}

export default function SwapQtyInputBox({ id, readOnly, decimals = 18, onChange, handleFocus, handleBlur }: InputBoxProps) {
    return (
        <InputBoxContainer>
            {/* <input
                id={id}
                type="number"
                className="bg-[#131723] text-white text-[22px] sm:text-[24px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                placeholder="0.0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyPress={(e) => {
                    let ev: any = e.target;
                    ((ev.value.toString().length >= 16) || (e.key === 'Enter')) && e.preventDefault();
                }}
                onChange={(event) => {
                    if (isNaN(Number(event.target.value))) onChange(0)
                    else onChange(event.target.value)
                }
                }
                min={0}
                required={true}
                readOnly={readOnly}
            /> */}
            <input
                id={id}
                type="text"
                className="bg-[#131723] text-white text-[22px] sm:text-[24px] rounded-md block w-full p-0 focus:outline-none min-w-[80px]"
                placeholder="0.0"
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
                readOnly={readOnly}
            />
        </InputBoxContainer>
    )
}