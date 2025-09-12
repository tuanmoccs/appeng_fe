// hooks/useVoiceChat.ts - Phiên bản cải thiện
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { VoiceService } from '../services/VoiceService';
import { TTSService } from '../services/TTSService';
import { ChatGPTService } from '../services/ChatGPTService';
import { Message, ChatState } from '../types/voicechat';

interface UseVoiceChatProps {
  openAIApiKey: string;
}

export const useVoiceChat = ({ openAIApiKey }: UseVoiceChatProps) => {
  const [state, setState] = useState<ChatState>(ChatState.IDLE);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const voiceService = useRef<VoiceService | null>(null);
  const ttsService = useRef<TTSService | null>(null);
  const chatGPTService = useRef<ChatGPTService | null>(null);
  const initializationRef = useRef<boolean>(false);
  const cleanupRef = useRef<boolean>(false);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Stop listening when app goes to background
        if (state === ChatState.LISTENING) {
          stopListening();
        }
        if (state === ChatState.SPEAKING) {
          stopSpeaking();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state]);

  const initializeServices = useCallback(async () => {
    if (initializationRef.current || cleanupRef.current) {
      console.log('Initialization already in progress or cleanup in progress');
      return;
    }
    
    initializationRef.current = true;
    setInitializationError(null);

    try {
      console.log('Initializing services...');

      // Tạo instances mới
      voiceService.current = new VoiceService();
      ttsService.current = new TTSService();
      chatGPTService.current = new ChatGPTService({ apiKey: openAIApiKey });

      // Initialize TTS Service first (ít lỗi hơn)
      await ttsService.current.initialize({
        onStart: () => {
          console.log('TTS started');
          setState(ChatState.SPEAKING);
        },
        onFinish: () => {
          console.log('TTS finished');
          setState(ChatState.IDLE);
        },
        onCancel: () => {
          console.log('TTS cancelled');
          setState(ChatState.IDLE);
        },
      });

      // Initialize Voice Service với timeout
      const voiceInitPromise = voiceService.current.initialize({
        onSpeechStart: () => {
          console.log('Speech started - updating state');
          setState(ChatState.LISTENING);
          setRecognizedText('');
        },
        onSpeechEnd: () => {
          console.log('Speech ended - updating state');
          // Chỉ set IDLE nếu không có recognized text để process
          if (!recognizedText.trim()) {
            setState(ChatState.IDLE);
          }
        },
        onSpeechError: (error) => {
          console.log('Speech error received:', error);
          setState(ChatState.IDLE);
          setRecognizedText('');
          
          // Don't show alert for common "no match" errors
          if (!error.includes('No speech was heard') && !error.includes('7/No match')) {
            Alert.alert('Voice Recognition Error', error);
          }
        },
        onSpeechResults: (text) => {
          console.log('Speech results received:', text);
          setRecognizedText(text);
          if (text.trim()) {
            sendToChatGPT(text);
          }
        },
      });

      // Thêm timeout cho voice initialization
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Voice initialization timeout')), 10000);
      });

      await Promise.race([voiceInitPromise, timeoutPromise]);

      setIsInitialized(true);
      initializationRef.current = false;
      console.log('All services initialized successfully');
    } catch (error: any) {
      console.error('Error initializing services:', error);
      initializationRef.current = false;
      
      const errorMessage = error.message || 'Unknown initialization error';
      setInitializationError(errorMessage);
      
      // Cleanup on error
      await cleanupServices();
      
      Alert.alert(
        'Initialization Error', 
        `Failed to initialize voice services: ${errorMessage}. Please check your device's microphone and speech recognition support.`,
        [
          {
            text: 'Retry',
            onPress: () => {
              setTimeout(() => {
                initializeServices();
              }, 1000);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  }, [openAIApiKey]);

  const cleanupServices = useCallback(async () => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    try {
      console.log('Cleaning up services...');
      
      if (voiceService.current) {
        await voiceService.current.destroy();
        voiceService.current = null;
      }
      
      if (ttsService.current) {
        ttsService.current.destroy();
        ttsService.current = null;
      }
      
      chatGPTService.current = null;
      
      setIsInitialized(false);
      initializationRef.current = false;
      console.log('All services cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up services:', error);
    } finally {
      cleanupRef.current = false;
    }
  }, []);

  useEffect(() => {
    initializeServices();
    return () => {
      cleanupServices();
    };
  }, []); // Removed dependencies để tránh re-init

  const startListening = useCallback(async () => {
    if (!isInitialized || !voiceService.current) {
      Alert.alert('Error', 'Voice services are not initialized yet. Please wait or try restarting the app.');
      return;
    }

    if (state === ChatState.SPEAKING && ttsService.current) {
      ttsService.current.stop();
      // Wait a bit for TTS to fully stop
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (state === ChatState.PROCESSING) {
      Alert.alert('Please wait', 'AI is still processing your previous message.');
      return;
    }

    setRecognizedText('');
    
    try {
      const started = await voiceService.current.startListening();
      
      if (started) {
        setState(ChatState.LISTENING);
        console.log('Voice listening started successfully');
      } else {
        setState(ChatState.IDLE);
        Alert.alert('Error', 'Failed to start voice recognition. Please check microphone permissions.');
      }
    } catch (error) {
      console.error('Error in startListening:', error);
      setState(ChatState.IDLE);
      Alert.alert('Error', 'Failed to start voice recognition.');
    }
  }, [isInitialized, state]);

  const stopListening = useCallback(async () => {
    if (voiceService.current) {
      await voiceService.current.stopListening();
    }
    setState(ChatState.IDLE);
  }, []);

  const sendToChatGPT = useCallback(async (text: string) => {
    console.log('Sending to ChatGPT:', text);
    setState(ChatState.PROCESSING);

    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      if (!chatGPTService.current) {
        throw new Error('ChatGPT service not initialized');
      }

      // Convert conversation to ChatGPT format (get recent history)
      const chatHistory = conversation.slice(-8).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await chatGPTService.current.sendMessage(text, chatHistory);

      // Add AI message to conversation
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, aiMessage]);

      // Speak the response
      if (ttsService.current) {
        await ttsService.current.speak(aiResponse);
      } else {
        setState(ChatState.IDLE);
      }
    } catch (error: any) {
      console.error('Error processing message:', error);
      
      let errorMessage = 'Sorry, I encountered an error.';
      if (error.message.includes('API key')) {
        errorMessage = 'Please check your OpenAI API key.';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your internet connection.';
      }

      Alert.alert('ChatGPT Error', errorMessage);

      // Add error message to conversation
      const errorMsg: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, errorMsg]);
      setState(ChatState.IDLE);
    }
  }, [conversation]);

  const stopSpeaking = useCallback(() => {
    if (ttsService.current) {
      ttsService.current.stop();
    }
  }, []);

  const clearConversation = useCallback(() => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConversation([]);
            setRecognizedText('');
            setState(ChatState.IDLE);
          },
        },
      ]
    );
  }, []);

  // Retry initialization function
  const retryInitialization = useCallback(async () => {
    await cleanupServices();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initializeServices();
  }, [initializeServices, cleanupServices]);

  return {
    state,
    conversation,
    recognizedText,
    isInitialized,
    initializationError,
    isListening: state === ChatState.LISTENING,
    isLoading: state === ChatState.PROCESSING,
    isSpeaking: state === ChatState.SPEAKING,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    retryInitialization,
  };
};
