import Pools from '@app/products/pools'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function WolfSwap() {
  return (
    <>
      <Head>
        <title>Grimace Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>      
      <Pools />
    </>
  )
}
