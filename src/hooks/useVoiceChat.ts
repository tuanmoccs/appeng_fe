// hooks/useVoiceChat.ts - Updated version
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { ImprovedVoiceService } from '../services/ImprovedVoiceService';
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

  const voiceService = useRef<ImprovedVoiceService | null>(null);
  const ttsService = useRef<TTSService | null>(null);
  const chatGPTService = useRef<ChatGPTService | null>(null);

  const initializeServices = useCallback(async () => {
    try {
      console.log('Initializing services...');

      // Initialize improved voice service with OpenAI API key
      voiceService.current = new ImprovedVoiceService(openAIApiKey);
      ttsService.current = new TTSService();
      chatGPTService.current = new ChatGPTService({ apiKey: openAIApiKey });

      // Initialize TTS Service
      await ttsService.current.initialize({
        onStart: () => setState(ChatState.SPEAKING),
        onFinish: () => setState(ChatState.IDLE),
        onCancel: () => setState(ChatState.IDLE),
      });

      // Initialize Voice Service
      await voiceService.current.initialize({
        onSpeechStart: () => {
          setState(ChatState.LISTENING);
          setRecognizedText('');
        },
        onSpeechEnd: () => {
          setState(ChatState.PROCESSING);
        },
        onSpeechError: (error: any) => {
          setState(ChatState.IDLE);
          setRecognizedText('');
          Alert.alert('Voice Error', error.message || error.toString());
        },
        onSpeechResults: (text: string) => {
          setRecognizedText(text);
          sendToChatGPT(text);
        },
      });

      setIsInitialized(true);
      console.log('All services initialized successfully');
    } catch (error: any) {
      console.error('Initialization error:', error);
      Alert.alert('Initialization Error', error.message);
    }
  }, [openAIApiKey]);

  const sendToChatGPT = useCallback(async (text: string) => {
    setState(ChatState.PROCESSING);

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

      const chatHistory = conversation.slice(-8).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await chatGPTService.current.sendMessage(text, chatHistory);

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
      console.error('ChatGPT error:', error);
      Alert.alert('AI Error', error.message);
      setState(ChatState.IDLE);
    }
  }, [conversation]);

  const startListening = useCallback(async () => {
  try {
    console.log('=== DEBUG: Starting voice recognition ===');
    console.log('Is initialized:', isInitialized);
    console.log('Voice service exists:', !!voiceService.current);
    console.log('Current state:', state);

    if (!isInitialized) {
      console.log('ERROR: Services not initialized');
      Alert.alert('Error', 'Voice services not ready');
      return;
    }

    if (!voiceService.current) {
      console.log('ERROR: Voice service is null');
      Alert.alert('Error', 'Voice service not available');
      return;
    }

    if (state === ChatState.SPEAKING && ttsService.current) {
      console.log('Stopping TTS first...');
      ttsService.current.stop();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRecognizedText('');
    
    console.log('Calling startListening...');
    const started = await voiceService.current.startListening();
    console.log('Start listening result:', started);
    
    if (!started) {
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  } catch (error) {
    console.error('=== DEBUG: startListening error ===', error);
    Alert.alert('Debug Error', `${error}`);
  }
}, [isInitialized, state]);

  const stopListening = useCallback(async () => {
    if (voiceService.current) {
      await voiceService.current.stopListening();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (ttsService.current) {
      ttsService.current.stop();
    }
  }, []);

  const clearConversation = useCallback(() => {
    Alert.alert(
      'Clear Conversation',
      'Clear all messages?',
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

  useEffect(() => {
    initializeServices();
    
    return () => {
      if (voiceService.current) voiceService.current.destroy();
      if (ttsService.current) ttsService.current.destroy();
    };
  }, [initializeServices]);

  return {
    state,
    conversation,
    recognizedText,
    isInitialized,
    isListening: state === ChatState.LISTENING,
    isLoading: state === ChatState.PROCESSING,
    isSpeaking: state === ChatState.SPEAKING,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
  };
};