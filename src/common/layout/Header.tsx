import { Portal } from "@mui/base"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import Wallet from "../Wallet"
import { useRouter } from "next/router"
import {
  SidebarItem,
  SIDEBAR_ITEMS,
  SIDEBAR_ROUTES,
} from "./LayoutConstants"
import BSCIcon from "../svgs/BSCIcon"
import ETHIcon from "../svgs/ETHIcon"
import POLYGONIcon from "../svgs/POLYGONIcon"
import { ChainId, useEthers } from "@usedapp/core"

export default function Header() {
  const { chainId } = useEthers()
  const router = useRouter()
  // const matchesDesktop = useMediaQuery(`(min-width: 1024px)`)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const wrapperRef = useRef(null)
  
  const routeMatch = (path: string) => {
    return router.pathname === path
  }

  const ChainIcon = ({ chainId, width, height }: { chainId: number, width: string, height: string }) => {
    if (chainId) {
      switch (chainId) {
        case ChainId.Mainnet:
          return (<ETHIcon width={width} height={height} />)
        case ChainId.Rinkeby:
          return (<ETHIcon width={width} height={height} />)
        case ChainId.Goerli:
          return (<ETHIcon width={width} height={height} />)
        case ChainId.BSC:
          return (<BSCIcon width={width} height={height} />)
        case ChainId.BSCTestnet:
          return (<BSCIcon width={width} height={height} />)
        case ChainId.Polygon:
          return (<POLYGONIcon width={width} height={height} />)
      }
    }
    return (<BSCIcon width={width} height={height} />)
  }

  const onClickMenu = (path: string, isActive: boolean) => {
    if (isActive) return
    router.push({
      pathname: path
    })
    setIsMenuOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    };
  }, [wrapperRef])

  return (
    <div className="w-full bg-[#341461]/[.3] fixed" style={{ zIndex: 2 }}>
      <div className="w-full flex justify-center md:justify-end py-2 px-4">
        <div className="flex gap-3 md:gap-4 items-center md:pr-4">
          <div className="flex gap-2 items-center">
            <div className="bg-white w-[28px] h-[28px] flex justify-center items-center" style={{ borderRadius: '50%' }}>
              <ChainIcon chainId={chainId} width="24px" height="24px" />
            </div>
            <span className="text-white text-[18px] md:text-[20px]">BSC</span>
          </div>
          <Wallet />
          <div className="relative text-white text-[18px] md:text-[20px] flex gap-1 cursor-pointer items-center"
            onClick={() => setIsMenuOpen((val: boolean) => !val)}
            ref={wrapperRef}>
            <span>MENU</span>
            {isMenuOpen ?
              <svg width="22" height="12" viewBox="0 0 26 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 1.5L13 12.5L24 1.5" stroke="#EFEFEF" strokeWidth="3" />
              </svg> :
              <svg width="22" height="12" viewBox="0 0 26 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 13.5L13 2.5L2 13.5" stroke="#EFEFEF" strokeWidth="3" />
              </svg>}
            <div className="shadow-sm shadow-[#505050] absolute top-[38px] right-0 w-full md:w-[200px] bg-[#341461]/[.3] py-3" style={{ display: isMenuOpen ? 'block' : 'none', zIndex: 9999 }}>
              {Object.keys(SIDEBAR_ITEMS).map((key) => {
                const isActive = routeMatch(SIDEBAR_ROUTES[key])
                return (
                  <div key={key} className={`w-full text-center hover:bg-[#341461]/[.2] ${isActive ? 'text-[#EEE]' : 'cursor-pointer text-white'} text-[18px] md:text-[20px]`}
                    onClick={() => onClickMenu(SIDEBAR_ROUTES[key], isActive)}>
                    {SIDEBAR_ITEMS[key]}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
