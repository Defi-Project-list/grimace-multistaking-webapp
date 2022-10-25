import type { NextPage } from 'next'
import React, { useEffect } from 'react'
import Wallet from '@app/common/Wallet'
import { formatEther } from '@ethersproject/units'
import { Mainnet, Config, Goerli } from '@usedapp/core'
import { getDefaultProvider } from 'ethers'
import Head from 'next/head'

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider('mainnet'),
    [Goerli.chainId]: getDefaultProvider('goerli'),
  },
}

const Home: NextPage = () => {

  return (
    <>      
      <Head>
        <title>Grimace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>      
    </>
  )
}

export default Home
