// services/VoiceService.ts
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import { NativeModules } from 'react-native';
console.log('NativeModules:', NativeModules);
import { Platform, PermissionsAndroid } from 'react-native';
console.log('Voice keys:', Object.keys(Voice));
export interface VoiceCallbacks {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onSpeechError: (error: string) => void;
  onSpeechResults: (text: string) => void;
}

export class VoiceService {
  private callbacks: VoiceCallbacks | null = null;
  private isInitialized = false;
  private isListening = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(callbacks: VoiceCallbacks): Promise<void> {
    // Tránh khởi tạo nhiều lần cùng lúc
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) return;

    this.initializationPromise = this._doInitialize(callbacks);
    return this.initializationPromise;
  }

  private async _doInitialize(callbacks: VoiceCallbacks): Promise<void> {
    this.callbacks = callbacks;

    try {
      console.log('Voice methods:', Object.keys(Voice));

      // Kiểm tra xem Voice có khả dụng không
      if (!Voice) {
        throw new Error('Voice module is not available');
      }

      // Cleanup trước khi khởi tạo mới với error handling
      try {
        // Kiểm tra xem có instance đang chạy không
        if (this.isListening) {
          await Voice.stop();
          this.isListening = false;
        }
        await Voice.destroy();
        Voice.removeAllListeners();
      } catch (e) {
        console.log('No previous instance to clean or cleanup failed:', e);
      }

      // Đợi một chút trước khi khởi tạo lại
      await new Promise(resolve => setTimeout(resolve, 100));

      // Đăng ký event listeners với error boundary
      this.setupEventListeners();

      // Test voice availability
      await this.testVoiceAvailability();

      this.isInitialized = true;
      this.initializationPromise = null;
      console.log('Voice service initialized successfully');
    } catch (error) {
      console.error('Error initializing Voice service:', error);
      this.isInitialized = false;
      this.initializationPromise = null;
      // throw new Error(`Failed to initialize voice service: ${error.message}`);
    }
  }

  private setupEventListeners(): void {
    try {
      Voice.onSpeechStart = (e: any) => {
        console.log('Speech started', e);
        this.isListening = true;
        this.callbacks?.onSpeechStart();
      };

      Voice.onSpeechRecognized = (e: SpeechRecognizedEvent) => {
        console.log('Speech recognized:', e);
      };

      Voice.onSpeechEnd = (e: any) => {
        console.log('Speech ended', e);
        this.isListening = false;
        this.callbacks?.onSpeechEnd();
      };

      Voice.onSpeechError = (e: SpeechErrorEvent) => {
        console.log('Speech error:', e);
        this.isListening = false;

        let errorMessage = 'Unknown error';
        if (e.error) {
          if (typeof e.error === 'string') {
            errorMessage = e.error;
          } else if (typeof e.error === 'object' && e.error.message) {
            errorMessage = e.error.message;
          }
        }

        // Xử lý các lỗi phổ biến
        if (errorMessage.includes('7/No match') || errorMessage.includes('7')) {
          errorMessage = 'No speech was heard. Please try again.';
        } else if (errorMessage.includes('5/Client side error')) {
          errorMessage = 'Microphone access error. Please check permissions.';
        } else if (errorMessage.includes('2/Network timeout')) {
          errorMessage = 'Network timeout. Please check your internet connection.';
        }

        this.callbacks?.onSpeechError(errorMessage);
      };

      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        console.log('Speech results:', e.value);
        if (e.value && e.value.length > 0) {
          const text = e.value[0];
          if (text && text.trim()) {
            this.callbacks?.onSpeechResults(text);
          }
        }
      };

      Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
        console.log('Partial results:', e.value);
      };

      Voice.onSpeechVolumeChanged = (e: any) => {
        // console.log('Volume changed:', e.value);
      };
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      throw error;
    }
  }

  private async testVoiceAvailability(): Promise<void> {
    try {
      if (!Voice || typeof Voice.start !== 'function') {
        console.warn('Voice module not loaded properly');
        return;
      }
      await Voice.start('en-US');
      await Voice.stop();
      console.log('Voice available: true');
    } catch (error) {
      console.warn('Voice availability test failed:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to recognize speech',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Microphone permission:', isGranted ? 'granted' : 'denied');
        return isGranted;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled automatically
  }

  async startListening(locale: string = 'en-US'): Promise<boolean> {
    try {
      console.log('Attempting to start listening...');

      if (!this.isInitialized) {
        console.error('Voice service not initialized');
        return false;
      }

      // Kiểm tra xem đã đang listening chưa
      if (this.isListening) {
        console.log('Already listening, stopping first...');
        await this.stopListening();
        // Đợi một chút trước khi start lại
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Kiểm tra permission
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('No microphone permission');
        return false;
      }

      // Kiểm tra Voice object trước khi gọi
      if (!Voice || typeof Voice.start !== 'function') {
        console.error('Voice.start is not available');
        return false;
      }

      // Start listening với error handling
      await Voice.start(locale);
      console.log('Voice recognition started successfully');
      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      
      // Thêm thông tin chi tiết về lỗi
      // if (error.message) {
      //   console.error('Error details:', error.message);
      // }
      
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (this.isListening && Voice && typeof Voice.stop === 'function') {
        await Voice.stop();
        this.isListening = false;
        console.log('Voice recognition stopped');
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      this.isListening = false;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.isListening = false;
      this.callbacks = null;
      this.initializationPromise = null;

      if (Voice) {
        if (Voice && typeof (Voice as any).destroy === 'function') {
          try {
            await (Voice as any).destroy();
          } catch (e) {
            console.log('Voice.destroy failed (ignored):', e);
          }
        }

        try {
          if (typeof Voice.removeAllListeners === 'function') {
            Voice.removeAllListeners();
          }
        } catch (removeError) {
          console.log('Remove listeners error (ignored):', removeError);
        }
      }

      this.isInitialized = false;
      console.log('Voice service destroyed successfully');
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }

  get isCurrentlyListening(): boolean {
    return this.isListening;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}
