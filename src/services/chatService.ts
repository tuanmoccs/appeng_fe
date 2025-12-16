import api from "./api"
import type { Admin, Conversation, Message } from "../types/chat"

export const chatService = {
  // Get list of available admins
  getAdmins: async (): Promise<Admin[]> => {
    const response = await api.get("/chat/admins")
    return response.data
  },

  // Get user's conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get("/chat/conversations")
    return response.data
  },

  // Start or get conversation with admin
  startConversation: async (adminId: number): Promise<{ conversation_id: number; admin: Admin }> => {
    const response = await api.post("/chat/conversations", { admin_id: adminId })
    return response.data
  },

  // Get messages in conversation
  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`)
    return response.data
  },

  // Send message
  sendMessage: async (conversationId: number, message: string): Promise<Message> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, { message })
    return response.data
  },
}
