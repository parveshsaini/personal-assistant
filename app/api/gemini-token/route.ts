import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_GEMINI_API_KEY should be replaced by GEMINI_API_KEY' },
        { status: 500 }
      )
    }

    // Ephemeral tokens require the v1alpha API version
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    })

    // Create an ephemeral token
    // The response has the format { name: 'auth_tokens/...' }
    const authTokensApi = (ai as any).authTokens || (ai as any).tokens
    const response = await authTokensApi.create({})

    return NextResponse.json({ token: response.name })
  } catch (error) {
    console.error('[Gemini Token Error]', error)
    return NextResponse.json(
      { error: 'Failed to generate ephemeral token' },
      { status: 500 }
    )
  }
}
