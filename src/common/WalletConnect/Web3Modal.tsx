import React, { useEffect, useState } from 'react'
import { useEthers, shortenAddress, useLookupAddress } from '@usedapp/core'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import CoinbaseWalletSDK from "@coinbase/wallet-sdk"
import { BlockExplorer_URLS, Rpc_URLS, CHAIN_ID_NAME_MAP, Native_Currencies } from '@app/constants/AppConstants'
import { getChainIdFromName } from '@app/utils/utils'

const providerOptions = {
  injected: {
    display: {
      name: 'Metamask',
      description: 'Connect with the provider in your Browser',
    },
    package: null,
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        56: "https://bsc-dataseed1.binance.org",
      },
      bridge: 'https://bridge.walletconnect.org',
    },
  },
  // coinbasewallet: {
  //   package: CoinbaseWalletSDK,
  //   options: {
  //     appName: "Web 3 Modal Demo",
  //     infuraId: process.env.INFURA_KEY
  //   }
  // },
}

export const Web3ModalButton = () => {
  const { account, activate, deactivate, chainId, connector } = useEthers()
  const [activateError, setActivateError] = useState('')
  const { error } = useEthers()
  const [web3Modal, setWeb3Modal] = useState(null)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    if (error) {
      setActivateError(error.message)
    }
  }, [error])

  useEffect(() => {
    const newWeb3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      theme: "dark"
    });

    setWeb3Modal(newWeb3Modal)
  }, [])

  useEffect(() => {
    // connect automatically and without a popup if user is already connected
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet()
    }
  }, [web3Modal])

  useEffect(() => {
    if (account) {
      if (getChainIdFromName('bsc') !== chainId) {
        switchNetwork()
      }
    }
  }, [chainId, provider, account])

  const switchNetwork = async () => {    
    if (provider) {
      const hexChainId = '0x' + getChainIdFromName('bsc').toString(16)
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: CHAIN_ID_NAME_MAP[getChainIdFromName('bsc')],
                  nativeCurrency: Native_Currencies[getChainIdFromName('bsc')],
                  rpcUrls: [Rpc_URLS[getChainIdFromName('bsc')]],
                  blockExplorerUrls: [BlockExplorer_URLS[getChainIdFromName('bsc')]],
                },
              ],
            });
            return
          } catch (addError) {

          }
        }

        deactivate()
        if (connector) {
          (connector as any)?.deactivate()
        }
      }
    }
  }

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect()
      setProvider(provider)
      await activate(provider)
      setActivateError('')
    } catch (error: any) {
      setActivateError(error.message)
    }
  }

  const activateProvider = async () => {
    if (web3Modal) {
      connectWallet()
    }
  }

  return activateProvider
}