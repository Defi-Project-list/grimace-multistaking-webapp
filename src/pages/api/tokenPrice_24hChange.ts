import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import {
  BITQUERY_GRAPHQL_URL,
  BITQUERY_HEADERS,
  CORS,
  BNBTokenAddress
} from "@app/constants/AppConstants"
import { getTwentyFourHoursAgo } from "@app/utils/helpers/time"
import {
  queryGetBNBPriceOf,
  queryPriceInBNB,
  queryPriceInBUSD,
} from "@app/hooks/Queries"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { baseCurrency } = req.query

  let d = new Date()
  d.setHours(d.getHours() - 24)
  const H24Ago_ISO = d.toISOString()

  try {
    const response = await axios.post(
      BITQUERY_GRAPHQL_URL,
      {
        query: queryGetBNBPriceOf,
        variables: {
          from: getTwentyFourHoursAgo().toISOString(),
          baseCurrency,
        },
        mode: CORS,
      },
      {
        headers: BITQUERY_HEADERS,
      }
    ).then(({ data }) => data)
    
    const priceResponse = await axios.post(
      BITQUERY_GRAPHQL_URL,
      {
        query: queryPriceInBNB,
        variables: {
          to: new Date().toISOString(),
          baseCurrency,
        },
        mode: CORS,
      },
      {
        headers: BITQUERY_HEADERS,
      }
    ).then(({ data }) => data)
    
    const bnbPriceResponse = await axios.post(
      BITQUERY_GRAPHQL_URL,
      {
        query: queryPriceInBUSD,
        variables: {
          to: new Date().toISOString(),
          baseCurrency: BNBTokenAddress,
        },
        mode: CORS,
      },
      {
        headers: BITQUERY_HEADERS,
      }
    ).then(({ data }) => data)
    
    const priceH24AgoResponse = await axios.post(
      BITQUERY_GRAPHQL_URL,
      {
        query: queryPriceInBNB,
        variables: {
          to: H24Ago_ISO,
          baseCurrency,
        },
        mode: CORS,
      },
      {
        headers: BITQUERY_HEADERS,
      }
    ).then(({ data }) => data)
    
    const bnbPriceH24AgoResponse = await axios.post(
      BITQUERY_GRAPHQL_URL,
      {
        query: queryPriceInBUSD,
        variables: {
          to: H24Ago_ISO,
          baseCurrency: BNBTokenAddress,
        },
        mode: CORS,
      },
      {
        headers: BITQUERY_HEADERS,
      }
    ).then(({ data }) => data)
    
    const priceInBNB = priceResponse.data?.ethereum?.dexTrades?.[0]?.value
    const quotes = response.data?.ethereum?.dexTrades
    let bnbPriceInBUSD = bnbPriceResponse.data.ethereum?.dexTrades?.[0]?.value
    let priceInBUSD = priceInBNB * bnbPriceInBUSD
    if (isNaN(priceInBUSD)) priceInBUSD = 0
    if (isNaN(bnbPriceInBUSD)) bnbPriceInBUSD = 0
    const firstQuote = quotes?.[0]
    const transformedQuote = quotes.map((quote: any) => ({
      time: Math.floor(new Date(quote.timeInterval.minute).getTime() / 1000),
      value: quote.value * bnbPriceInBUSD,
    }))
    
    const priceH24AgoInBNB = priceH24AgoResponse.data?.ethereum?.dexTrades?.[0]?.value
    const bnbPriceH24AgoInBUSD = bnbPriceH24AgoResponse.data?.ethereum?.dexTrades?.[0]?.value
    let priceH24AgoInBUSD = priceH24AgoInBNB * bnbPriceH24AgoInBUSD
    
    if (isNaN(priceH24AgoInBUSD)) priceH24AgoInBUSD = 0
    let h24_price_change = 0
    if (priceH24AgoInBUSD > 0 && priceInBUSD > 0) h24_price_change = priceInBUSD / priceH24AgoInBUSD * 100
    if (priceH24AgoInBUSD === 0) h24_price_change = 0
    else h24_price_change -= 100
    
    res.status(200).json({      
      data: transformedQuote,
      price: priceInBUSD,
      bnbPrice: bnbPriceInBUSD,
      h24_price_change: h24_price_change
    })
  } catch (error) {    
    res.status(500).json({ error })
  }
}
