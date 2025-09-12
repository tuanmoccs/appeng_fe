// services/TTSService.ts
import Tts from 'react-native-tts';

export interface TTSCallbacks {
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export class TTSService {
  private callbacks: TTSCallbacks | null = null;
  private isInitialized = false;

  async initialize(callbacks: TTSCallbacks): Promise<void> {
    if (this.isInitialized) return;

    this.callbacks = callbacks;

    // Check if TTS is available
    if (!Tts) {
      console.error('TTS is not available');
      throw new Error('TTS service is not available');
    }

    try {
      // Configure TTS with error handling
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.error('Error configuring TTS:', error);
      // Continue with initialization even if configuration fails
    }

    // Set up event listeners
    Tts.addEventListener('tts-start', () => {
      this.callbacks?.onStart();
    });

    Tts.addEventListener('tts-finish', () => {
      this.callbacks?.onFinish();
    });

    Tts.addEventListener('tts-cancel', () => {
      this.callbacks?.onCancel();
    });

    this.isInitialized = true;
    console.log('TTS service initialized successfully');
  }

  async speak(text: string): Promise<void> {
    try {
      await Tts.speak(text);
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  stop(): void {
    try {
      Tts.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  destroy(): void {
    try {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
      this.isInitialized = false;
      this.callbacks = null;
      console.log('TTS service destroyed successfully');
    } catch (error) {
      console.error('Error destroying TTS service:', error);
    }
  }
}