import RNFS from 'react-native-fs';
import { Platform } from 'react-native'
export interface WhisperConfig {
  apiKey: string;
  model?: string;
}

export class WhisperService {
  private config: WhisperConfig;

  constructor(config: WhisperConfig) {
    this.config = {
      model: 'whisper-1',
      ...config,
    };
  }

  async transcribeAudio(filePath: string): Promise<string> {
    try {
      // Read file as base64
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('Audio file not found');
      }

      // Create form data
      const formData = new FormData();
      
      // For React Native, we need to handle file upload differently
      const fileUri = Platform.OS === 'ios' ? filePath : `file://${filePath}`;
      
      formData.append('file', {
        uri: fileUri,
        type: 'audio/mp4',
        name: 'audio.mp4',
      } as any);
      
      formData.append('model', this.config.model || 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }
}