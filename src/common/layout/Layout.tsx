import React, { PropsWithChildren, useEffect, useState } from "react"
import { SIDEBAR_ITEMS } from "./LayoutConstants"

export default function Layout({ children }: PropsWithChildren<{}>) {
  const [title, setTitle] = useState(SIDEBAR_ITEMS[0])

  const changeTitle = (t: string) => {
    setTitle(t)
  }

  return (
    <>      
      <div className="w-full flex justify-center">
        <div className="px-4 sm:px-6 lg:px-10 bg-[#131723] desktop-layout">
          <div className="flex w-full items-center justify-between">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
