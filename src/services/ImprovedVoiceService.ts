// services/ImprovedVoiceService.ts - Fixed version
import AudioRecorderPlayer, {
  AVEncodingOption,
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
  AudioSet,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { WhisperService } from './WhisperService';

export type VoiceCallbacks = {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
  onSpeechResults?: (result: string) => void;
};

export class ImprovedVoiceService {
  private callbacks: VoiceCallbacks | null = null;
  private isInitialized = false;
  private isListening = false;
  private audioRecorderPlayer: AudioRecorderPlayer;
  private whisperService: WhisperService;
  private recordingPath: string;
  private recordingTimeout: NodeJS.Timeout | null = null;

  constructor(openAIApiKey: string) {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.whisperService = new WhisperService({ apiKey: openAIApiKey });
    this.recordingPath = '';
  }

  async initialize(callbacks: VoiceCallbacks): Promise<void> {
    if (this.isInitialized) return;

    this.callbacks = callbacks;

    try {
      await this.requestPermissions();

      const timestamp = Date.now();
      // Sử dụng path đơn giản hơn
      this.recordingPath = Platform.select({
        ios: `recording_${timestamp}.m4a`,
        android: `${RNFS.CachesDirectoryPath}/recording_${timestamp}.mp4`,
      }) || '';

      this.isInitialized = true;
      console.log('Voice service initialized with path:', this.recordingPath);
    } catch (error) {
      console.error('Voice service initialization error:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // Chỉ request RECORD_AUDIO permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('Permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission granted');
          return true;
        } else {
          console.log('Microphone permission denied');
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS không cần request runtime permission
  }

  async startListening(): Promise<boolean> {
    console.log('=== DEBUG: VoiceService.startListening called ===');
  console.log('Is initialized:', this.isInitialized);
  console.log('Is listening:', this.isListening);
  console.log('Recording path:', this.recordingPath);
    if (!this.isInitialized || this.isListening) {
      console.log('Cannot start listening:', { initialized: this.isInitialized, listening: this.isListening });
      return false;
    }

    try {
      console.log('Checking permissions...');
      const hasPermission = await this.requestPermissions();
      console.log('Has permission:', hasPermission);
      if (!hasPermission) {
        console.log('Permission denied');
        this.callbacks?.onSpeechError?.('Microphone permission not granted');
        return false;
      }

      this.callbacks?.onSpeechStart?.();
      this.isListening = true;

      // Sử dụng cấu hình đơn giản
      const audioSet: AudioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
      };

      console.log('Starting recording...');
      await this.audioRecorderPlayer.startRecorder(this.recordingPath, audioSet);

      // Auto stop after 30 seconds
      this.recordingTimeout = setTimeout(() => {
        console.log('Recording timeout reached');
        this.stopListening();
      }, 30000);

      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      this.isListening = false;
      this.callbacks?.onSpeechError?.(`Recording failed: ${error}`);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      console.log('Stopping recording...');
      await this.audioRecorderPlayer.stopRecorder();
      this.isListening = false;
      this.callbacks?.onSpeechEnd?.();

      // Kiểm tra file tồn tại trước khi transcribe
      const fileExists = await RNFS.exists(this.recordingPath);
      if (!fileExists) {
        throw new Error('Recording file not found');
      }

      const stats = await RNFS.stat(this.recordingPath);
      console.log('Recording file size:', stats.size);

      if (stats.size < 1000) {
        throw new Error('Recording too short');
      }

      // Transcribe the audio
      const text = await this.whisperService.transcribeAudio(this.recordingPath);

      if (text.trim()) {
        this.callbacks?.onSpeechResults?.(text.trim());
      } else {
        this.callbacks?.onSpeechError?.('No speech detected');
      }

      // Cleanup
      await this.cleanupRecording();
    } catch (error) {
      console.error('Stop listening error:', error);
      this.callbacks?.onSpeechError?.(`Transcription failed: ${error}`);
      await this.cleanupRecording();
    }
  }

  private async cleanupRecording(): Promise<void> {
    try {
      if (this.recordingPath && (await RNFS.exists(this.recordingPath))) {
        await RNFS.unlink(this.recordingPath);
        console.log('Recording file cleaned up');
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      this.isListening = false;
      this.callbacks = null;

      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
      }

      await this.audioRecorderPlayer.stopRecorder();
      await this.cleanupRecording();

      this.isInitialized = false;
      console.log('Voice service destroyed');
    } catch (error) {
      console.error('Destroy error:', error);
    }
  }

  get isCurrentlyListening(): boolean {
    return this.isListening;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}
