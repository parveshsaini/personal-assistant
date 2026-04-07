import { Modality, ThinkingLevel } from '@google/genai'
import { gemini } from './client'
import { ALL_DECLARATIONS } from './function-declarations'

const MODEL = 'gemini-2.5-flash-native-audio-latest'

export async function createEphemeralToken(): Promise<string> {
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString()

  const token = await gemini.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: MODEL,
        config: {
          sessionResumption: {},
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: ALL_DECLARATIONS }],
          systemInstruction: {
            parts: [{
              text: `You are a highly capable personal assistant. You help the user manage their calendar, emails, Slack messages, Notion pages, spreadsheets, and CRM. Be concise and action-oriented. When you take an action (like sending an email or creating a calendar event), always confirm what you did. Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
            }]
          }
        }
      },
      httpOptions: { apiVersion: 'v1alpha' }
    }
  })

  return token.name as string
}
