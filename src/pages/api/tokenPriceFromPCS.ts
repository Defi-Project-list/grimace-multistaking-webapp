import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { baseCurrency } = req.query
    try {
        const response = await axios.get(`${process.env.PCS_API_URL}/tokens/${baseCurrency}`).then(({ data }) => data)
        res.status(200).json({
            updatedAt: response.updated_at,
            price: response.data.price,
            bnbPrice: 1 / response.data.price_BNB * response.data.price
        })
    } catch (error) {
        res.status(500).json({ error })
    }
}
