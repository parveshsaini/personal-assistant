import { getDb } from './client'
import type { Conversation, Message } from './schema'

export async function listConversations(): Promise<Conversation[]> {
  const db = getDb()
  const { data, error } = await db
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function createConversation(title?: string): Promise<Conversation> {
  const db = getDb()
  const { data, error } = await db
    .from('conversations')
    .insert({ title: title ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  const db = getDb()
  const { error } = await db
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const db = getDb()
  const { data, error } = await db
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function appendMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  modality: 'text' | 'voice' = 'text'
): Promise<Message> {
  const db = getDb()
  const { data, error } = await db
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, modality })
    .select()
    .single()
  if (error) throw error

  // Touch updated_at on the conversation
  await db
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}
