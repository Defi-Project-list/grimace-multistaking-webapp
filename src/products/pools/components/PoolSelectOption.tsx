
export default function PoolSelectOption({ isSelected }: { isSelected: boolean }) {
    return (
        <>
            {
                isSelected ?
                    <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="url(#paint0_radial_0_1)" />
                            <circle cx="10.2632" cy="10.2632" r="3.94737" fill="#EFEFEF" />
                            <defs>
                                <radialGradient id="paint0_radial_0_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10 10) rotate(90) scale(10)">
                                    <stop stopColor="#341461" />
                                    <stop offset="1" stopColor="#7A30E0" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </> :
                    <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g filter="url(#filter0_i_25_71)">
                                <circle cx="10" cy="10" r="10" fill="#EFEFEF" />
                            </g>
                            <defs>
                                <filter id="filter0_i_25_71" x="0" y="0" width="20" height="22" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="2" />
                                    <feGaussianBlur stdDeviation="2" />
                                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0.203922 0 0 0 0 0.0784314 0 0 0 0 0.380392 0 0 0 0.25 0" />
                                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_25_71" />
                                </filter>
                            </defs>
                        </svg>
                    </>
            }
        </>
    )
}