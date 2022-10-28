import React, { useMemo, useState, useEffect, useRef } from 'react'

export default function InfoSVG({ width, height }: { width: string, height: string }) {

    return (
        <svg width={width} height={height} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M5 0.909091C2.74065 0.909091 0.909091 2.74065 0.909091 5C0.909091 7.25935 2.74065 9.09091 5 9.09091C7.25935 9.09091 9.09091 7.25935 9.09091 5C9.09091 2.74065 7.25935 0.909091 5 0.909091ZM0 5C0 2.23858 2.23858 0 5 0C7.76142 0 10 2.23858 10 5C10 7.76142 7.76142 10 5 10C2.23858 10 0 7.76142 0 5Z" fill="#F3BA2F" />
            <path fillRule="evenodd" clipRule="evenodd" d="M4.99996 2.72729C5.25099 2.72729 5.4545 2.9308 5.4545 3.18184V5.00002C5.4545 5.25106 5.25099 5.45457 4.99996 5.45457C4.74892 5.45457 4.54541 5.25106 4.54541 5.00002V3.18184C4.54541 2.9308 4.74892 2.72729 4.99996 2.72729Z" fill="#F3BA2F" />
            <path fillRule="evenodd" clipRule="evenodd" d="M4.54541 6.81819C4.54541 6.56715 4.74892 6.36365 4.99996 6.36365H5.0045C5.25554 6.36365 5.45905 6.56715 5.45905 6.81819C5.45905 7.06923 5.25554 7.27274 5.0045 7.27274H4.99996C4.74892 7.27274 4.54541 7.06923 4.54541 6.81819Z" fill="#F3BA2F" />
        </svg>
    )
}