// types/index.ts
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export enum ChatState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
}