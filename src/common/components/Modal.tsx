
interface PopupProps {
    isOpen?: boolean,
    children?: React.ReactNode,
    bgColor?: string,
    handleClose: () => void
}

const modalStyle = {    
    maxHeight: 'calc(100vh - 250px)',    
    maxWidth: '520px'
}

export default function Modal({
    isOpen,
    children,
    bgColor,
    handleClose
}: PopupProps) {

    const handleWindowClick = (event) => {
        const modal = document.getElementById("grimace-modal");
        if (event.target.id == modal.id) {
            handleClose()
        }
    }
    return (
        <div
            id="grimace-modal"
            aria-hidden="true"
            role="dialog"
            style={{ backgroundColor: '#11111170', display: isOpen ? "flex" : "none" }}
            className="modal-fadeIn overflow-y-auto overflow-x-hidden fixed right-0 left-0 z-50 justify-center items-center h-modal h-full inset-0"
            onClick={(e) => handleWindowClick(e)}
        >
            <div className="px-4 w-full h-auto mt-8" style={modalStyle}>
                <div className={`drop-shadow-2xl rounded-lg`} style={{ backgroundColor: bgColor ?? '#111111' }}>
                    {children}
                </div>
            </div>
        </div>
    )
}