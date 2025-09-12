export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export interface ChatBotState {
  messages: ChatMessage[]
  isLoading: boolean
  isVisible: boolean
}

export interface OpenAIRequest {
  model: string
  messages: Array<{
    role: string
    content: string
  }>
  max_tokens?: number
  temperature?: number
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
