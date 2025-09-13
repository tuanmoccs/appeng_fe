// services/VoiceService.ts - Using react-native-audio-recorder-player
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

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
  private audioRecorderPlayer: AudioRecorderPlayer;
  private recordingPath: string;
  private recordingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.recordingPath = '';
  }

  async initialize(callbacks: VoiceCallbacks): Promise<void> {
    if (this.isInitialized) return;

    this.callbacks = callbacks;

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Set recording path
      const timestamp = Date.now();
      this.recordingPath = Platform.select({
        ios: `voice_recording_${timestamp}.m4a`,
        android: `${RNFS.CachesDirectoryPath}/voice_recording_${timestamp}.mp4`,
      }) || '';

      this.isInitialized = true;
      console.log('Voice service initialized successfully');
    } catch (error) {
      console.error('Error initializing Voice service:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('Permissions result:', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('All permissions granted');
          return true;
        } else {
          console.log('Permissions denied');
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async startListening(): Promise<boolean> {
    if (!this.isInitialized || this.isListening) {
      return false;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this.callbacks?.onSpeechError('Microphone permission not granted');
        return false;
      }

      this.callbacks?.onSpeechStart();
      this.isListening = true;

      // Configure recording options
      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
      };

      console.log('Starting recording at path:', this.recordingPath);
      
      // Start recording
      await this.audioRecorderPlayer.startRecorder(this.recordingPath, audioSet);
      
      // Auto stop recording after 10 seconds
      this.recordingTimeout = setTimeout(() => {
        this.stopListening();
      }, 10000);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isListening = false;
      this.callbacks?.onSpeechError(`Recording failed: ${error}`);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      // Clear timeout
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      // Stop recording
      const result = await this.audioRecorderPlayer.stopRecorder();
      console.log('Recording stopped:', result);
      
      this.isListening = false;
      this.callbacks?.onSpeechEnd();

      // Process the recorded audio
      await this.processRecordedAudio();
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isListening = false;
      this.callbacks?.onSpeechError(`Stop recording failed: ${error}`);
    }
  }

  private async processRecordedAudio(): Promise<void> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(this.recordingPath);
      if (!fileExists) {
        throw new Error('Recording file not found');
      }

      // Get file stats
      const stats = await RNFS.stat(this.recordingPath);
      console.log('Recording file size:', stats.size);

      if (stats.size < 1000) {
        throw new Error('Recording too short or empty');
      }

      // Convert audio to text using OpenAI Whisper API
      await this.transcribeAudio();
    } catch (error) {
      console.error('Error processing recorded audio:', error);
      this.callbacks?.onSpeechError(`Audio processing failed: ${error}`);
    }
  }

  private async transcribeAudio(): Promise<void> {
    try {
      // Read the audio file as base64
      const audioBase64 = await RNFS.readFile(this.recordingPath, 'base64');
      
      // For now, simulate transcription
      // In a real app, you would send this to OpenAI Whisper API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate recognized text
      const simulatedText = "Hello, this is a test transcription";
      
      this.callbacks?.onSpeechResults(simulatedText);
      
      // Clean up the recording file
      await this.cleanupRecording();
    } catch (error) {
      console.error('Error transcribing audio:', error);
      this.callbacks?.onSpeechError(`Transcription failed: ${error}`);
    }
  }

  private async cleanupRecording(): Promise<void> {
    try {
      if (this.recordingPath && await RNFS.exists(this.recordingPath)) {
        await RNFS.unlink(this.recordingPath);
        console.log('Recording file cleaned up');
      }
    } catch (error) {
      console.log('Error cleaning up recording file:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      this.isListening = false;
      this.callbacks = null;

      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      // Stop any ongoing recording
      try {
        await this.audioRecorderPlayer.stopRecorder();
      } catch (e) {
        console.log('No active recording to stop');
      }

      // Cleanup recording file
      await this.cleanupRecording();

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
