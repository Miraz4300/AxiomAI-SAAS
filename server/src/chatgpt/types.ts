import type { ChatMessage } from 'chatgpt'

export interface RequestOptions {
  message: string
  lastContext?: { conversationId?: string; parentMessageId?: string }
  process?: (chat: ChatMessage) => void
  temperature?: number
  top_p?: number
}

export interface BalanceResponse {
  total_usage: number
}
