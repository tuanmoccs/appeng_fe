export interface Admin {
  id: number
  name: string
  avatar: string
  is_online: boolean
  last_seen_at?: string
}

export interface User {
  id: number
  name: string
  avatar: string
  is_online: boolean
}

export interface Message {
  id: number
  message: string
  type: "text" | "image" | "file"
  file_url?: string
  is_mine: boolean
  sender: {
    name: string
    avatar: string
  }
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: number
  admin: Admin
  last_message?: {
    message: string
    created_at: string
    is_mine: boolean
  }
  unread_count: number
  last_message_at: string
}
