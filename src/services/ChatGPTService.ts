// services/ChatGPTService.ts
import axios from 'axios';

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export interface ChatGPTConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  timeout?: number;
}

export class ChatGPTService {
  private config: ChatGPTConfig;

  constructor(config: ChatGPTConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      maxTokens: 150,
      temperature: 0.7,
      presencePenalty: 0.6,
      frequencyPenalty: 0.3,
      timeout: 30000,
      ...config,
    };
  }

  private getSystemPrompt(): string {
    return 'You are a helpful English conversation partner. Keep responses conversational, natural, and not too long (under 100 words). Speak as if you are having a real conversation.';
  }

  async sendMessage(userMessage: string, conversationHistory: ChatGPTMessage[] = []): Promise<string> {
    try {
      const messages: ChatGPTMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(),
        },
        // Get last 10 messages to save tokens
        ...conversationHistory.slice(-10),
        { role: 'user', content: userMessage },
      ];

      const response = await axios.post<ChatGPTResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          presence_penalty: this.config.presencePenalty,
          frequency_penalty: this.config.frequencyPenalty,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      if (!aiResponse) {
        throw new Error('No response from ChatGPT');
      }

      return aiResponse;
    } catch (error: any) {
      console.error('ChatGPT API Error:', error);
      
      let errorMessage = 'Failed to get response from ChatGPT';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (error.response?.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Bad request. Please check your API configuration.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your internet connection.';
        }
      }
      
      throw new Error(errorMessage);
    }
  }
}