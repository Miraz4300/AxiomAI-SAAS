import process from 'node:process'
import axios from 'axios'

export interface AzureData {
  status: string
  data: { region: string; token: string } | null
  message: string
}

export async function getAzureSubscriptionKey(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const speechKey = process.env.AZURE_SUBSCRIPTION_KEY
  const speechRegion = process.env.AZURE_SPEECH_REGION

  if (!speechKey || !speechRegion) {
    res.status(400).send({
      status: 'noSpeechKey',
      data: null,
      message: 'This feature will available soon.',
    })
  }
  else {
    const headers = {
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    try {
      const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers)
      res.send({
        data: { token: tokenResponse.data, region: speechRegion },
        status: 'Success',
        message: 'Get token successfully',
      })
    }
    catch (err) {
      res.status(401).send({
        status: 'Fail',
        data: null,
        message: err.toString(),
      })
    }
  }
}
