import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/pools")    
  })

  return (
    <>
    </>
  )
}

export default Home
