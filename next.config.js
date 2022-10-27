/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // webpack5: false,
  swcMinify: true,
  env: {    
    network: 'testnet',
    blockchain: 'bsc',
    NEXT_PUBLIC_BITQUERY_API_URL: 'https://graphql.bitquery.io',
    NEXT_PUBLIC_BINANCE_NODE: 'https://bsc-dataseed.binance.org/',
    BITQUERY_API_KEY: 'BQYGwbLnSZ8ocUnHRwrKq3bp74MuwxDZ',    
    PCS_API_URL: 'https://api.pancakeswap.info/api/v2'    
  },
}

module.exports = nextConfig
